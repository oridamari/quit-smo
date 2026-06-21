# מדריך התקנה - Quit & Reward (GitHub Pages & Gist)

אפליקציה זו משתמשת ב-GitHub כפלטפורמה בחינם גם לאחסון הקוד (GitHub Pages) וגם כמסד נתונים פשוט דרך GitHub Gists.
עקבו אחר השלבים הבאים כדי להגדיר הכל.

## שלב 1: יצירת Gist (מסד הנתונים)
1. התחברו לחשבון ה-GitHub שלכם.
2. גשו לכתובת: [https://gist.github.com/](https://gist.github.com/)
3. בתיבת התיאור (Gist description) כתבו: `Quit Smoking Data`
4. בתיבת שם הקובץ (Filename including extension) כתבו בדיוק: `quit_smo_data.json`
5. בתוכן הקובץ, הדביקו את הקוד הבא (כדי להתחיל עם נתונים ראשוניים):
```json
{
  "settings": {
    "dailyGoal": 10,
    "milestones": [
      { "name": "עיסוי", "cost": 200 },
      { "name": "מסעדה טובה", "cost": 500 }
    ]
  },
  "history": []
}
```
6. לחצו על הכפתור הירוק למטה: **Create secret gist**.
7. לאחר היצירה, הסתכלו בשורת הכתובת בדפדפן. היא תיראה בערך כך: `https://gist.github.com/your-username/1a2b3c4d5e6f7g8h9i0j`.
8. העתיקו ושמרו בצד את המחרוזת הארוכה שבסוף הכתובת (`1a2b3c4d5e6f7g8h9i0j`). זהו ה- **Gist ID** שלכם.

## שלב 2: יצירת Personal Access Token (PAT)
כדי שהאפליקציה תוכל לערוך את ה-Gist, היא צריכה הרשאה.
1. ב-GitHub, לחצו על תמונת הפרופיל שלכם בפינה הימנית-עליונה ובחרו ב- **Settings**.
2. גללו למטה בתפריט השמאלי ולחצו על **Developer settings**.
3. לחצו על **Personal access tokens** ואז בחרו ב- **Tokens (classic)**.
4. לחצו על הכפתור **Generate new token** -> **Generate new token (classic)**.
5. ב-Note, כתבו: `Quit Smo App Token`.
6. תחת Expiration, מומלץ לבחור **No expiration** (או שתצטרכו לחדש אותו כל כמה זמן).
7. ברשימת ה-Scopes, סמנו V **רק בתיבה שנקראת `gist`**.
8. גללו למטה ולחצו על **Generate token**.
9. הועתק למסך טוקן שמתחיל ב-`ghp_...`. **העתיקו ושמרו אותו במקום בטוח!** לא תוכלו לראות אותו שוב לעולם. זהו ה- **Personal Access Token** שלכם.

## שלב 3: העלאה ל-GitHub Pages
1. צרו Repository חדש ב-GitHub (למשל בשם `quit-smo`).
2. העלו את כל הקבצים שנוצרו בתיקייה זו (`index.html`, `style.css`, `app.js`) ל-Repository.
3. בעמוד ה-Repository, לחצו על **Settings** בתפריט העליון.
4. בתפריט השמאלי, בחרו ב- **Pages**.
5. תחת **Source**, שנו את `None` ל-`main` (או `master`), ולחצו **Save**.
6. המתינו דקה-שתיים, ויופיע לינק ירוק עם הכתובת לאפליקציה שלכם (בדרך כלל `https://your-username.github.io/quit-smo/`).
7. היכנסו ללינק מהטלפון שלכם (ושמרו אותו במסך הבית!).
8. במסך הראשון, האפליקציה תבקש מכם את ה-**Gist ID** (משלב 1) ואת ה-**Token** (משלב 2). הזינו אותם פעם אחת, והם יישמרו על המכשיר!

## מנהל מערכת (Admin)
כדי להיכנס לפאנל הניהול שבו תוכלו לשנות את היעד היומי ולערוך היסטוריה, פשוט הוסיפו `?view=admin` לסוף כתובת ה-URL שלכם בדפדפן.
לדוגמה: `https://your-username.github.io/quit-smo/?view=admin`
