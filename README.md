Site: [https://jackieeric.com/](jackieeric.com)

### Development

Get the code:

    git clone https://github.com/ebidel/wedding-site --recursive
    cd wedding-site
    npm install

Start up the App Engine dev server. Run `gulp` any time you make changes to JS code.

### Deployment

    ./scripts/deploy.sh 2016-09-18

### Updating the SSL cert

From https://github.com/AirConsole/letsencrypt:

1. Go to [https://jackieeric.com/.well-known/acme-challenge/](https://jackieeric.com/.well-known/acme-challenge/) and login as an administrator
2. Temp change the endpoint in app.yaml to `secure: false`.
3. Execute the displayed command in a shell that supports curl and openssl (Google Cloud Shell can be used)
Upload the obtained certificates on [https://console.cloud.google.com/appengine/settings/certificates](https://console.cloud.google.com/appengine/settings/certificates)
