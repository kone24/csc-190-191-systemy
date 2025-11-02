import { Country as ICountry, State as IState } from '../types/location';
import { Country, State } from 'country-state-city';

// Get all countries with their ISO codes and convert to our format
export const COUNTRIES: ICountry[] = Country.getAllCountries().map(country => ({
  code: country.isoCode,
  name: country.name,
}));

// Create a record of states by country
export const STATES_BY_COUNTRY: Record<string, IState[]> = 
  COUNTRIES.reduce((acc, country) => {
    const states = State.getStatesOfCountry(country.code);
    if (states.length > 0) {
      acc[country.code] = states.map(state => ({
        code: state.isoCode,
        name: state.name,
      }));
    }
    return acc;
  }, {} as Record<string, IState[]>);