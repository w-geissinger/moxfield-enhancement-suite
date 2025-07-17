import Papa from 'papaparse';

let myToken: string | undefined = undefined;

//there is way more type info than I need here right now, but for posterity...
export interface AuthenticateResponse {
    "refresh": {
        "access_token": string,
        "refresh_token": string,
        "token_type": "Bearer",
        "user_name": string,
        "email_address": string,
        "is_email_confirmed": true,
        "expiration": string,
        "expires_in_minutes": number,
        "permissions": [
            "adult"
        ],
        "preferences": {
            "hasConfirmedCardTraderModal": "true" | "false", //lol string boolean
            "collectionStyle": "visual"//TODO: figure out the values here if it becomes relevant
        },
        "view_settings": {
            "groupBy": "type",//TODO: figure out the values here if it becomes relevant
            "sortBy": "name", //TODO: figure out the values here if it becomes relevant
            "useMana": boolean,
            "usePrice": boolean,
            "useSet": boolean,
            "columns": "three",
            "isHighlightBarEnabled": boolean,
            "isDarkModeEnabled": boolean,
            "playStyle": "paperDollars", //TODO: what the heck is this guy
            "viewMode": "table", //TODO: fill out other view mode values if it becomes relevant
            "personalDeckListMode": "list", //TODO: fill out other list values if it becomes relevant
            "viewAsAuthorIntends": boolean,
            "splitPrimerWidth": number,
            "primerTheme": "default", //not sure if there are other values here
            "foilMode": "animated" | string, //not sure what other foil modes there might be
            "showLegalOnly": boolean,
            "ignoreAuthorOverrides": boolean,
            "allowMultiplePrintings": boolean,
            "useTiers": boolean,
            "collectionStyle": string
        },
        "user_id": string,
        "nolt_token": string,
        "mature_content_pref": "matureContent",
        "date_of_birth": string, //YYYY-MM-DD
        "collectionVisibility": "private" | "public" | "unlisted",
        "collectionPublicId": string
    },
    "wishList": {
        "deck": {
            "id": string,
            "name": "Wish List",
            "description": string,
            "format": "wishList",
            "visibility": "unlisted",
            "publicUrl": string,
            "publicId": string,
            "likeCount": number,
            "viewCount": number,
            "commentCount": number,
            "sfwCommentCount": number,
            "bookmarkCount": number,
            "areCommentsEnabled": boolean,
            "isShared": boolean,
            "authorsCanEdit": boolean,
            "createdByUser": {
                "userName": string,
                "displayName": string,
                "badges": []
            },
            "authors": [
                {
                    "userName": string,
                    "displayName": string,
                    "badges": []
                }
            ],
            "requestedAuthors": [],
            "boards": {
                "mainboard": {
                    "count": 0,
                    "cards": unknown
                },
                "sideboard": {
                    "count": 0,
                    "cards": unknown
                },
                "maybeboard": {
                    "count": 0,
                    "cards": unknown
                },
                "commanders": {
                    "count": 0,
                    "cards": unknown
                },
                "companions": {
                    "count": 0,
                    "cards": unknown
                },
                "signatureSpells": {
                    "count": 0,
                    "cards": unknown
                },
                "attractions": {
                    "count": 0,
                    "cards": unknown
                },
                "stickers": {
                    "count": 0,
                    "cards": unknown
                },
                "contraptions": {
                    "count": 0,
                    "cards": unknown
                },
                "planes": {
                    "count": 0,
                    "cards": unknown
                },
                "schemes": {
                    "count": 0,
                    "cards": unknown
                },
                "tokens": {
                    "count": 0,
                    "cards": unknown
                }
            },
            "version": 0,
            "tokens": [],
            "tokensToCards": unknown,
            "cardsToTokens": unknown,
            "tokenMappings": unknown,
            "hubs": [],
            "createdAtUtc": string,
            "lastUpdatedAtUtc": string,
            "exportId": string,
            "tags": unknown,
            "authorTags": unknown,
            "isTooBeaucoup": false,
            "affiliates": {
                "ck": "Moxfield",
                "tcg": "Moxfield",
                "csi": "Moxfield",
                "ch": "moxfield",
                "cm": "moxfield",
                "scg": "moxfield",
                "ct": "moxfield"
            },
            "mainCardIdIsBackFace": boolean,
            "allowPrimerClone": boolean,
            "enableMultiplePrintings": boolean,
            "includeBasicLandsInPrice": boolean,
            "includeCommandersInPrice": boolean,
            "includeSignatureSpellsInPrice": boolean,
            "colors": unknown[],
            "colorIdentity": unknown[],
            "media": unknown[],
            "ownerUserId": string,
            "ignoreBrackets": boolean
        },
        "viewerInfo": {
            "isLiked": boolean,
            "isOwner": boolean,
            "isPinned": boolean,
            "isBookmarked": boolean,
            "tags": unknown,
            "preferredPrintings": unknown,
            "collection": unknown
        }
    },
    "allLists": {
        "massLandDenial": {
            [key: string]: boolean
        },
        "gameChangers": {
            [key: string]: boolean
        },
        "extraTurns": {
            [key: string]: boolean
        },
        "tutors": {
            [key: string]: boolean
        }
    },
}

//retrieves a bearer token and stores it within this module's scope. Returns true if successful.
export async function Authenticate(): Promise<boolean> {
    const response = await fetch('https://api2.moxfield.com/v1/startup/authenticated', {
        method: 'POST',
        body: JSON.stringify({
            ignoreCookie: false,
            isAppLogin: false
        }),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer undefined',
            'Accept': 'application/json, text/plain, */*'
        }
    });

    const json = await response.json();

    myToken = json?.refresh?.access_token;

    if (myToken) {
        return true;
    }

    return false;
}

export interface BinderResponse {
    id?: string,
    name: string | string[],
    description?: string,
    publicId?: string,
    visibility?: "public" | "private" | "unlisted",
    createdAtUtc?: string,
    lastUpdatedAtUtc?: string,
    isPinned?: boolean,
    createdBy?: {
        userName: string,
        displayName: string,
        "badges": []
    }
}

export async function CreateBinder(name: string): Promise<BinderResponse> {
    const response = await fetch(
        'https://api2.moxfield.com/v1/trade-binders', {
        method: 'POST',
        body: JSON.stringify({
            description: "This binder was generated by Moxfield Enhancement Suite.",
            name: name,
            visibility: "public"
        }),
        headers: {
            'Authorization': `Bearer ${myToken as string}`,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    });

    const json = await response.json();

    return json;
}

export interface ImportResponse {
    errors?: {
        lineNumber: number;
        errorMessage: string;
        originalText: string;
    };
    isSuccessful: boolean;
    totalImportedCount: number;
}

export async function ImportCards(file: Blob, binderId: string): Promise<ImportResponse> {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }

    const response = await fetch(`https://api2.moxfield.com/v1/collections/import-file/?game=paper&defaultCondition=nearMint&defaultCardLanguageId=LD58x&defaultQuantity=1&tradeBinderId=${binderId}&playStay=paperDollars&format=moxfield`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${myToken as string}`,
            'Accept': 'application/json, text/plain, */*',
        }
    })

    const json = await response.json();

    return json;
}

export async function GetFileContents(file: File): Promise<string> {

    const prom = new Promise<string>((resolve => {
        const reader = new FileReader();

        reader.addEventListener('load', function (e) {
            resolve(e?.target?.result as string)
        })

        reader.readAsBinaryString(file)
    }))

    return prom;
}

export async function TCGPlayerToMoxfieldCSV(file: File): Promise<File> {

    //unpack blob data to csv string
    const data = await GetFileContents(file);

    //row collector for converted CSV rows
    const MoxfieldRows: string[] = [];

    //better combos, better decks... papa john's
    const parsed: string[][] = Papa.parse(data)?.data as unknown as string[][];

    //strip TCGPlayer headers
    parsed.shift();

    //strip empty last row
    parsed.pop();

    parsed
        .forEach((row: string[], index: number) => {
            if (row[2] === undefined) {
                alert('The extension encountered a mega oopsie while converting. Talk to Wayne. There is info in the console (hit f12, do not refresh)')
                console.log('MEGA OOPSIE:', parsed, row, index)
            }
            if (row[2].includes(',')) {
                row[2] = `"${row[2]}"`
            }
            MoxfieldRows.push(`${row[0]},${row[0]},${row[2]},${row[5]},${row[7]},${row[8]},${row[6] === 'Foil' ? 'Foil' : ''},,,${row[4]},,,`)
        })

    //Add the moxfield headers
    MoxfieldRows.unshift(["Count", "Tradelist Count", "Name", "Edition", "Condition", "Language", "Foil", "Tags", "Last Modified", "Collector Number", "Alter", "Proxy", "Purchase Price"].join(','));

    //join all newly created moxfield rows
    const completeMoxfieldCSV = MoxfieldRows.join('\n');

    //convert to blob
    const blob = new Blob([completeMoxfieldCSV], { type: 'text/csv' });

    //plop blob in a file with the same name as the old one
    return new File([blob], file.name);
}