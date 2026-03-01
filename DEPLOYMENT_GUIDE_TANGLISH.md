# 🚀 Deployment Guide: Netlify (Frontend) & Render (Backend) Single Repository-laye!

Indha guide la nammaloda **Church Management Web App**-oda Frontend ah **Netlify**-layum, Backend ah **Render**-layum OREY single repository vachu epdi host panrathu nu thelivaah paakalaam.

---

## ☁️ Padhivu 1: Backend-ai Render.com la Deploy Seivathu 

Namakku backend Node.js (Express & TypeScript) ulla `backend` folder-kulla irukku. Idhai namma andha root repo la irundhe deploy pannalam.

### Step 1: Render Account Create Pannunga
1. [Render.com](https://render.com) poiyitu GitHub account vachu sign up/login pannunga.
2. Top right la **"New +"** button click panni **"Web Service"** select pannunga.
3. Unga **Single GitHub Repository** ah connect pannunga.

### Step 2: Render Settings Setup 
Connect pannathum, indha details ah fill pannunga:
- **Name**: `church-management-backend` (illa ungaluku pudicha peru)
- **Environment**: `Node`
- **Region**: Default aah irukattum (Singapore or Frankfurt is good).
- **Root Directory**: `backend` *(🚨 Idhu romba mukkiyam! namma single repo kullan `backend` folder kullathaan namma server code iruku).*
- **Build Command**: `npm install && npm run build` *(TypeScript ah JS ah maatha)*
- **Start Command**: `npm start` *(Unge package.json ulla iruka node dist/index.js kku)*
- **Plan**: Free tier ($0) select pannikonga.

### Step 3: Environment Variables (.env variables) tharanum.
Keezha `Advanced` -> `Add Environment Variable` click panni, unga `.env` file la irukara ella values um inga add pannunga. 
Mukkiyamaaha:
- `DB_HOST` = (Unga TiDB cloud host)
- `DB_USER` = (Database user)
- `DB_PASSWORD` = (Database password)
- `DB_NAME` = defaultdb
- `DB_PORT` = 4000
- `JWT_SECRET` = (Unga secret key)
- `SUPER_ADMIN_EMAIL` & `SUPER_ADMIN_PASSWORD`

*(🚨 Kurippu: `PORT` variable thara thevai illai, Render adhai automatic-ah set pannikkum).*

### Step 4: Deploy !
Ellam set pannathum **"Create Web Service"** click pannunga. 
Konja neram (2-3 mins) build aagum. Mudinjathum top left-la ungaluku oru URL  kidaikkuma. (E.g. `https://church-backend-xyz.onrender.com`).
**Indha URL ah copy panni vachikonga! Idhu dhaan backend API link.**

---

## 🌐 Padhivu 2: Frontend-ai Netlify.com la Deploy Seivathu

Ippo API ready! Namma Frontend UI ah Netlify la use panni single repo laye eduthukallaam.

### Step 1: Netlify la Deploy Pannunga
1. [Netlify.com](https://www.netlify.com/) poyi login pannunga.
2. **"Add new site" -> "Import an existing project"** click pannunga.
3. GitHub select panni unga **Adhe Single Repository** ah choose pannunga.

### Step 2: Build Settings & Environment Variables
Inga namma root folder dhaan frontend aaga irukkum:
- **Base directory**: ` ` *(idhaiyem fill pannavendaam illana `/` podunga)*
- **Build command**: `npm run build`
- **Publish directory**: `dist` 

**(Pro Level Tip - Environment Variables):** 
Unga code la `config.ts` poi hardcode pandrathuku bathila, Netlify laye variable set pannidalaam. Adhe build settings page-la konjam keela **"Environment variables"** -> **"Add a variable"** click pannunga:
- **Key**: `VITE_API_URL`
- **Value**: `https://church-backend-xyz.onrender.com` (Unga actual render url)
*Ipdithaan veliyula code-ah disturb panama host pandrathu method.*

**(Mukkiyam):** React Router page refresh panna work aaga, `public` folder ulla `_redirects` nu oru file create panni, ulla indha line mattum add panni vachikonga: `/*    /index.html   200`. Illana refresh panrapa "Page Not Found" varum.

### Step 4: Deploy Site
**"Deploy site"** click pannunga. 
Oru 1 minute la unga frontend live aagidum! 🎉

Netlify ungaluku oru link tharum `https://xyz-church-app.netlify.app`. Neenga domain settings poitu custom perum vechikalaam (`https://ecclesia-church.netlify.app`)

---

## ✅ Deployment Santhoshippu (Verification Check)
1. Netlify URL-ah open pannunga, azhagana Login page varum.
2. Super Admin details vachu login panni paarunga.
3. Settings Update / Admin Create ellaam work aagudhaa nu check pannikonga.
*(Note: Render free tier use pandrathaala, daily 1st req konjam slow aah 50 secs la load aagum (Server sleep mod). Adhuku apm super fast ah velaseiyum).*

Azhagaaha deploy pannitinga! Vaalthukkal! 🚀
