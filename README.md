# Ignite Co. | $1 contractor offer

Standalone Vercel funnel. The current Ignite funnel is not a dependency. The public application presents all five questions before asking for name, company, email, and phone.

## Enable lead intake
Set the dedicated production HighLevel webhook in Vercel and redeploy:

- `OFFER_DISCOVERY_CALENDAR_URL` (optional override): Defaults to the approved [Lead Plan Call](https://api.leadconnectorhq.com/widget/bookings/lead-plan-call1) calendar.
- `OFFER_GHL_WEBHOOK_URL`: The dedicated HighLevel inbound webhook. Configure Create/Update Contact, include the phone/email match key, and map the metadata and five answer fields. Key follow-up deduplication with `submission_id`. Keep this URL server-side; never publish it in GitHub or share it with the browser.

The funnel refuses to collect submissions until the webhook and a valid calendar URL are available. It will only show the booking page after HighLevel accepts the submission. Scheduling itself does not request payment.

## Checkout and group onboarding
After the discovery call, Asher sends the approved $1 checkout only to accepted applicants. Configure the payment processor’s successfully-paid redirect to the dedicated HighLevel **group** onboarding booking URL. Do not place checkout or the group calendar on the public application page. Attendees should not be charged at either calendar. Cover the full commercial terms on the discovery call before checkout.

## Run tests
```sh
npm test
```
