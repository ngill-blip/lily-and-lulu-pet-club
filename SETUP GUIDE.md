# 🐾 Lily & Lulu Pet Club — Website Setup Guide

This guide connects the Thoughts & Ideas website to Google's cloud so thoughts
sync across all devices (phone, tablet, laptop). Takes about 5 minutes.

---

## Step 1 — Open Google Apps Script

Go to: **https://script.google.com**

Log in with the Google account you want to use (nishitagill@gmail.com).

---

## Step 2 — Create a new project

Click **"New project"** (top left corner).

---

## Step 3 — Paste the backend code

1. You'll see a code editor with some default text. **Select all of it and delete it.**
2. Open the file called **`Code.gs`** in this folder.
3. **Copy everything** in that file (Ctrl+A, then Ctrl+C).
4. **Paste it** into the Apps Script editor (Ctrl+V).
5. At the top, click on "Untitled project" and rename it to: **Lily and Lulu Thoughts**
6. Click **Save** (the floppy disk icon, or Ctrl+S).

---

## Step 4 — Deploy the script as a website

1. Click the blue **"Deploy"** button (top right).
2. Select **"New deployment"**.
3. Click the gear icon ⚙️ next to "Select type" and choose **"Web app"**.
4. Fill in the settings:
   - **Description:** Lily and Lulu Thoughts
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
5. Click **"Deploy"**.
6. Google will ask you to authorise the app — click **"Authorise access"**, choose your account, click **"Allow"**.
7. You'll get a **Web app URL** — it looks like:
   `https://script.google.com/macros/s/ABC123.../exec`
8. **Copy that URL.**

---

## Step 5 — Connect the URL to the website

1. Open the file **`index.html`** in this folder using any text editor
   (right-click → Open With → TextEdit on Mac).
2. Find this line (near the bottom):
   ```
   const API_URL = 'YOUR_APPS_SCRIPT_URL';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL` with the URL you copied.
   It should look like:
   ```
   const API_URL = 'https://script.google.com/macros/s/ABC123.../exec';
   ```
4. Save the file (Ctrl+S).

---

## Step 6 — Push the update to GitHub

Double-click **"Push to GitHub.command"** in this folder.
This uploads the updated website so the live URL shows the changes.

---

## Done! 🎉

The website will be live at:
**https://ngill-blip.github.io/lily-and-lulu-pet-club/**

Bookmark this on every device. Thoughts saved on one device will appear
on all the others within a few seconds.

---

## Bonus — The data lives in Google Sheets too

When the first thought is saved, a Google Sheet called
**"🐾 Lily & Lulu — Thoughts Log"** will appear in Google Drive.
You can open it any time to see all the thoughts in a spreadsheet.
