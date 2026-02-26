```php

add_action('gform_after_submission_4', 'headword_send_to_crm', 10, 2);

function headword_send_to_crm($entry, $form) {
    // ── Configuration ──────────────────────────────────────────
    // Replace with your actual CRM API URL and secret.
    $api_url = 'https://deployedsite.com/clients/contact';
    $api_secret = '$API_SECRET';

    // ── Field ID mapping ───────────────────────────────────────
    $first_name = rgar($entry, '1'); 
    $last_name  = rgar($entry, '3');  
    $email      = rgar($entry, '4');   
    $message    = rgar($entry, '5');    
 

    // Skip if required fields are missing.
    if (empty($first_name) || empty($email)) {
        return;
    }

    $payload = array(
        'firstName'  => trim($first_name),
        'lastName'   => trim($last_name),
        'email'      => trim($email),
        'message'    => trim($message),
        'source'     => 'headword.co',
    );

    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-Api-Secret' => $api_secret,
        ),
        'body'    => wp_json_encode($payload),
        'timeout' => 15,
    ));

    // log errors for debugging.
    if (is_wp_error($response)) {
        error_log('CRM webhook error: ' . $response->get_error_message());
    } else {
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 201) {
            error_log('CRM webhook warning: HTTP ' . $code . ' — ' . wp_remote_retrieve_body($response));
        }
    }
}
```

### 3. Security note

The snippet above hardcodes the API secret for simplicity. For production, store
it as a WordPress constant in `wp-config.php` (need host file manager access) instead:

```php
// In wp-config.php:
define('CRM_API_SECRET', 'your-secret-here');

// In the snippet, replace:
$api_secret = 'YOUR_CONTACT_FORM_SECRET';
// with:
$api_secret = defined('CRM_API_SECRET') ? CRM_API_SECRET : '';
```

---

### Troubleshooting

| Symptom | Cause | Fix |

| 403 Forbidden | Wrong or missing secret | Verify `X-Api-Secret` header matches `CONTACT_FORM_SECRET` in backend `.env` |
| 403 Missing required fields | Field mapping wrong | Check that `firstName` and `email` keys are mapped correctly |
| Connection timeout | API not reachable | Verify the Request URL is correct and the backend is running |
| Duplicate email error | Client already exists | Expected behavior — the CRM rejects duplicates |
| Order form creating CRM records | Wrong form ID in hook | Verify the number in `gform_after_submission_X` matches only the contact form ID |
| PHP snippet not firing | Wrong field IDs | Double-check field IDs by hovering fields in the form editor |
| PHP snippet not firing | Hook not registered | In WPCode, verify the snippet is **Active** and code type is **PHP Snippet** |
| Snippet shows error on save | Syntax error in code | WPCode will flag the error — fix the typo and re-save |
