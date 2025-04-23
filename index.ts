import { writeFileSync } from 'fs';
import * as ics from "ics";

const startingHeader = {
    "User-Agent": "CVVS/std/4.1.7 Android/n10",
    "Z-Dev-Apikey": "Tg1NWEwNGIgIC0K",
    "Content-Type": "application/json",
}

const printBanner = () => {
    console.log("\r\n   _____    ___   _____      _ \r\n  \/ ____|  |__ \\ \/ ____|    | |\r\n | |  __   __ ) | |     __ _| |\r\n | |  \\ \\ \/ \/\/ \/| |    \/ _` | |\r\n | |___\\ V \/\/ \/_| |___| (_| | |\r\n  \\_____\\_\/|____|\\_____\\__,_|_|\r\n");
    console.log("Connect the classeviva agenda to an actual calendar. 📆")
    console.log("Made by SysWhite, ⭐️ star the repo on Github if you like it!\n");
}

const getUserAuth = async (): Promise<{ token: string, uid: string }> => {
    const tokenRequest = await fetch("https://web.spaggiari.eu/rest/v1/auth/login", {
        headers: startingHeader,
        method: "POST",
        body: JSON.stringify({ "ident": null, "pass": process.env.CLASSEVIVA_PASSWORD as string, "uid": process.env.CLASSEVIVA_USERNAME as string })
    });
    if (tokenRequest.status !== 200) {
        throw new Error("❌ Failed to authenticate with classeviva.");
    }
    const tokenResponse = await tokenRequest.json() as { token: string, ident: string };
    console.log("✅ Successfully authenticated with classeviva.");
    return {
        token: tokenResponse.token,
        uid: tokenResponse.ident.slice(1, -1)
    }
}

const getAgendaInterval = (): string[] => {
    try {
        return [new Date(), new Date()].map((d, i) => {
            d.setMonth(d.getMonth() + (i ? Number(process.env.AGENDA_INTERVAL) : Number(process.env.AGENDA_INTERVAL) * -1));
            return d.toISOString().slice(0, 10).replace(/-/g, '');
        });
    } catch (error) {
        console.error("❌ Failed to get agenda interval:", error);
        return [new Date().toISOString().slice(0, 10).replace(/-/g, ''), new Date().toISOString().slice(0, 10).replace(/-/g, '')];
    }
}

const getAgendaItems = async (token: string, uid: string): Promise<ics.EventAttributes[]> => {
    const agendaRequest = await fetch(`https://web.spaggiari.eu/rest/v1/students/${uid}/agenda/all/${getAgendaInterval()[0]}/${getAgendaInterval()[1]}`, {
        headers: {
            ...startingHeader,
            "Z-Auth-Token": token
        },
        method: "GET"
    });
    if (agendaRequest.status !== 200) {
        throw new Error("❌ Failed to fetch agenda items.");
    }
    const agenda = (await agendaRequest.json() as { agenda: any[] }).agenda as {
        evtId: number;
        evtCode: string;
        evtDatetimeBegin: string;
        evtDatetimeEnd: string;
        isFullDay: boolean;
        notes: string;
        authorName: string;
        classDesc: string;
        subjectId: string | null;
        subjectDesc: string | null;
        homeworkId: string | null;
    }[];
    console.log("✅ Successfully fetched agenda items.");
    return agenda
        .map((event) => {
            const start = new Date(event.evtDatetimeBegin);
            const end = new Date(event.evtDatetimeEnd);
            return {
                title: event.subjectDesc || event.authorName,
                organizer: { name: event.authorName, email: `${event.authorName.toLocaleLowerCase().replace(/ /g, '.')}@syswhite.dev` },
                description: event.notes,
                busyStatus: "FREE" as "FREE" | "TENTATIVE" | "BUSY" | "OOF",
                start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()] as [number, number, number, number, number],
                duration: { minutes: Math.round((end.getTime() - start.getTime()) / 60000) }
            };
        });
}

const updateAgendaCalendarFile = async () => {
    const { token, uid } = await getUserAuth();
    ics.createEvents((await getAgendaItems(token, uid)), (error: any, value: any) => {
        if (error) {
            console.log("❌ Failed to update calendar file.");
        } else {
            console.log("✅ Successfully updated calendar file.");
        }
        writeFileSync(`${__dirname}/agenda.ics`, value)
    })
}

printBanner();

if (!process.env.CLASSEVIVA_PASSWORD || !process.env.CLASSEVIVA_USERNAME) {
    console.error("❌ Please set the CLASSEVIVA_PASSWORD and CLASSEVIVA_USERNAME environment variables.");
    process.exit(1);
}
if (!process.env.AGENDA_INTERVAL) {
    console.error("❌ Please set the AGENDA_INTERVAL environment variable.");
    process.exit(1);
}

updateAgendaCalendarFile();

