# 1pl-prod-loop-gateway

This is the static front door for **https://loop.1plasticlife.org/** (1 Plastic Life LOOP, Production).
It is served by GitHub Pages from the `main` branch, root folder. It contains no secrets and no server code.
The buttons link to the public LOOP web app (Google Apps Script `/exec` views).
Staff and partner sign-in happens inside LOOP or at https://www.1plasticlife.org/loop-signin.html.

Published from the site root:
- `index.html` is the gateway page.
- `CNAME` holds the custom domain (`loop.1plasticlife.org`).
- `.nojekyll` turns off Jekyll processing.
- `eula.html` is the LOOP TimeActivity End User License Agreement: https://loop.1plasticlife.org/eula.html
- `qbo-disconnected.html` is the QuickBooks disconnect landing page: https://loop.1plasticlife.org/qbo-disconnected.html

Privacy policy (hosted on the public site, not this repo): https://www.1plasticlife.org/privacy.html

The staging gateway is https://qa-loop.1plasticlife.org/ (repo `1plasiclife/1pl-qa-loop-gateway`).
