# Technical Architecture
<img width="960" height="540" alt="Technical Architecture" src="https://github.com/user-attachments/assets/b4321214-5f78-443d-b13c-b5b036b39d8f" />

## Frontend
* ReactNative technology to allow for cross platform development for iOS and Android from one code base
* Sqllite for database storage in app to store user data
* RadixUI for frontend elements, icons, forms, dialogs, buttons, etc
* Report Screen generates PDF (same PDF will be used for send email)
* Frontend has a private key identifying the user (same key will be used to encrypt the JSON of user data)

## Backend
* ReactNative authenticates via Supabase
* Supabase sends back token
* Token authenticates to serverless functions at AWS Lambda
* AWS Lambda 1 - PDF generated in frontend, Message written in frontend. Backend receives PDF and Message and sends email to end user.
* AWS Lambda 2 - Encrypted JSON of user data, User UUID in frontend.  Backend receives JSON and UUID, stores in AWS S3

## Open points
* Use SendGrid to send email from AWS Lambda or direct to Google/Microsoft?
* Which private key in app to use for encrypting JSON for synchronziation to cloud?  Consider scenarios of user moving from device to device.  Is it login based instead?
* Should we allow/support user export/import of data?  Can they do direct and from cloud based on their login?
