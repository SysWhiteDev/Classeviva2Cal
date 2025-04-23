# Classeviva2Cal
View the classeviva agenda in an actual calendar app. 📆

⭐ Star this on GitHub — it motivates me a lot!
## Index
- [Prerequisites](#prerequisites)
- [Features](#features)
- [Usage](#usage)

## Prerequisites
- [Bun](https://bun.sh) (v1.2.8+ reccomended)
- [Classeviva](https://www.classeviva.it/) account

## Features
- [x] `.ics` file support.
- [ ] Support for GitHub Actions.

## Usage
1. Duplicate the `.env.example` file and rename it to `.env` so that your files look like the following.
```
Classeviva2Cal/
├── .env.example  
├── .env     
├── .gitignore
├── README.md        
├── index.ts  
├── tsconfig.json       
├── package.json
└── bun.lock        
```

2. Edit the `.env` file and fill in the required fields:
```env
# ClasseViva Credentials
CLASSEVIVA_USERNAME="S12345678X" <-- EDIT THIS
CLASSEVIVA_PASSWORD="YourPassword" <-- EDIT THIS

# Agenda Fetching Settings
AGENDA_INTERVAL=6  # Number of months to fetch events before and after the current date
```

3. Install the dependencies:
```bash
bun install
```

4. Run the script:
```bash
bun run index.ts
```
*NOTE: To keep the calendar up-to-date, you will need to run the script periodically, to do this you can set up a cron job to run the script periodically. For example, to run it every day at 8 AM.*

5. Subscribe to the generated ics file in your preferred calendar app. 

*NOTE: You need to make the file available on a web server, to do this i used nginx but you can use any web server you prefer.*

If you set up everything correctly, your url should be something like this:

```
https://yourbeautifulserver.com/agenda.ics
```
<br/>

---

# Liked it? Star it! ⭐
