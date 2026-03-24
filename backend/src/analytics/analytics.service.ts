import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Analytics Supabase client initialized');
  }

  /**
   * Compute the start date for a given range string relative to now.
   */
  private getStartDate(range: string): string | null {
    const now = new Date();
    switch (range) {
      case '7d':
        now.setDate(now.getDate() - 7);
        return now.toISOString();
      case '30d':
        now.setDate(now.getDate() - 30);
        return now.toISOString();
      case '90d':
        now.setDate(now.getDate() - 90);
        return now.toISOString();
      case '1y':
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
      case 'all':
      default:
        return null;
    }
  }

  /**
   * Compute a "previous period" start date for period-over-period comparison.
   * e.g. if range is 30d, previous period is 60d-ago to 30d-ago.
   */
  private getPreviousPeriodDates(range: string): { prevStart: string; prevEnd: string } | null {
    const now = new Date();
    switch (range) {
      case '7d': {
        const prevEnd = new Date(now);
        prevEnd.setDate(prevEnd.getDate() - 7);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - 7);
        return { prevStart: prevStart.toISOString(), prevEnd: prevEnd.toISOString() };
      }
      case '30d': {
        const prevEnd = new Date(now);
        prevEnd.setDate(prevEnd.getDate() - 30);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - 30);
        return { prevStart: prevStart.toISOString(), prevEnd: prevEnd.toISOString() };
      }
      case '90d': {
        const prevEnd = new Date(now);
        prevEnd.setDate(prevEnd.getDate() - 90);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - 90);
        return { prevStart: prevStart.toISOString(), prevEnd: prevEnd.toISOString() };
      }
      case '1y': {
        const prevEnd = new Date(now);
        prevEnd.setFullYear(prevEnd.getFullYear() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setFullYear(prevStart.getFullYear() - 1);
        return { prevStart: prevStart.toISOString(), prevEnd: prevEnd.toISOString() };
      }
      default:
        return null;
    }
  }

  /**
   * Helper: compute percentage change between two values.
   */
  private percentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Group rows by month label (e.g. "Mar 2026") using a date field.
   */
  private groupByMonth(
    rows: any[],
    dateField: string,
    valueField?: string,
  ): { month: string; value: number }[] {
    const monthMap = new Map<string, number>();

    for (const row of rows) {
      const d = new Date(row[dateField]);
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const current = monthMap.get(label) || 0;
      const increment = valueField ? parseFloat(row[valueField]) || 0 : 1;
      monthMap.set(label, current + increment);
    }

    // Sort by date
    const sorted = Array.from(monthMap.entries()).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    });

    return sorted.map(([month, value]) => ({ month, value }));
  }

  /**
   * GET /analytics/summary
   * Returns KPI card data: totalRevenue, totalClients, newClients,
   * invoiceCount, conversionRate, and period-over-period changes.
   */
  async getSummary(range: string) {
    const startDate = this.getStartDate(range);
    const prevPeriod = this.getPreviousPeriodDates(range);

    try {
      // --- Total clients ---
      const { count: totalClients, error: clientErr } = await this.supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientErr) this.logger.error('Error fetching total clients:', clientErr);

      // --- New clients in current period ---
      let newClientsQuery = this.supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      if (startDate) newClientsQuery = newClientsQuery.gte('created_at', startDate);
      const { count: newClients, error: newClientErr } = await newClientsQuery;

      if (newClientErr) this.logger.error('Error fetching new clients:', newClientErr);

      // --- Invoices in current period ---
      let invoiceQuery = this.supabase.from('invoice').select('amount, status');
      if (startDate) invoiceQuery = invoiceQuery.gte('created_at', startDate);
      const { data: invoices, error: invoiceErr } = await invoiceQuery;

      if (invoiceErr) this.logger.error('Error fetching invoices:', invoiceErr);

      const invoiceCount = invoices?.length || 0;
      const paidInvoices = invoices?.filter((i) => i.status === 'paid') || [];
      const totalRevenue = paidInvoices.reduce(
        (sum, i) => sum + (parseFloat(i.amount) || 0),
        0,
      );
      const conversionRate =
        invoiceCount > 0
          ? Math.round((paidInvoices.length / invoiceCount) * 100)
          : 0;

      // --- Previous period comparison ---
      let revenueChange = 0;
      let clientChange = 0;

      if (prevPeriod) {
        // Previous period new clients
        const { count: prevNewClients } = await this.supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', prevPeriod.prevStart)
          .lt('created_at', prevPeriod.prevEnd);

        clientChange = this.percentChange(newClients || 0, prevNewClients || 0);

        // Previous period revenue
        const { data: prevInvoices } = await this.supabase
          .from('invoice')
          .select('amount, status')
          .gte('created_at', prevPeriod.prevStart)
          .lt('created_at', prevPeriod.prevEnd);

        const prevRevenue = (prevInvoices || [])
          .filter((i) => i.status === 'paid')
          .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

        revenueChange = this.percentChange(totalRevenue, prevRevenue);
      }

      return {
        totalRevenue,
        totalClients: totalClients || 0,
        newClients: newClients || 0,
        invoiceCount,
        conversionRate,
        revenueChange,
        clientChange,
      };
    } catch (error) {
      this.logger.error('Error computing summary:', error);
      throw error;
    }
  }

  /**
   * GET /analytics/revenue-by-month
   * Returns monthly revenue from paid invoices.
   */
  async getRevenueByMonth(range: string) {
    const startDate = this.getStartDate(range);

    try {
      let query = this.supabase
        .from('invoice')
        .select('amount, created_at, status')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      if (startDate) query = query.gte('created_at', startDate);

      const { data: invoices, error } = await query;

      if (error) {
        this.logger.error('Error fetching revenue by month:', error);
        throw error;
      }

      const grouped = this.groupByMonth(invoices || [], 'created_at', 'amount');
      return grouped.map((item) => ({
        month: item.month,
        revenue: Math.round(item.value * 100) / 100,
      }));
    } catch (error) {
      this.logger.error('Error in getRevenueByMonth:', error);
      throw error;
    }
  }

  /**
   * GET /analytics/client-growth
   * Returns client acquisition count by month.
   */
  async getClientGrowth(range: string) {
    const startDate = this.getStartDate(range);

    try {
      let query = this.supabase
        .from('clients')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (startDate) query = query.gte('created_at', startDate);

      const { data: clients, error } = await query;

      if (error) {
        this.logger.error('Error fetching client growth:', error);
        throw error;
      }

      const grouped = this.groupByMonth(clients || [], 'created_at');
      return grouped.map((item) => ({
        month: item.month,
        clients: item.value,
      }));
    } catch (error) {
      this.logger.error('Error in getClientGrowth:', error);
      throw error;
    }
  }

  /**
   * GET /analytics/invoice-status
   * Returns count of invoices by status.
   */
  async getInvoiceStatus(range: string) {
    const startDate = this.getStartDate(range);

    try {
      let query = this.supabase.from('invoice').select('status');
      if (startDate) query = query.gte('created_at', startDate);

      const { data: invoices, error } = await query;

      if (error) {
        this.logger.error('Error fetching invoice status:', error);
        throw error;
      }

      const statusCounts = { paid: 0, unpaid: 0, overdue: 0, cancelled: 0 };
      for (const inv of invoices || []) {
        const s = inv.status as keyof typeof statusCounts;
        if (s in statusCounts) {
          statusCounts[s]++;
        }
      }

      return statusCounts;
    } catch (error) {
      this.logger.error('Error in getInvoiceStatus:', error);
      throw error;
    }
  }
}
