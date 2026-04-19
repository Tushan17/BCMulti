# AngularApp – Business Central Angular + PrimeNG Add-In

An Angular 21 + PrimeNG 21 control addin for Business Central, mirroring the pattern
established by the [ReactApp](../ReactApp/README.md).

---

## Repository structure

```
AngularApp/
├── angular-app/          # Angular 21 source application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts / app.html / app.scss    # Root component
│   │   │   ├── app.config.ts                   # Providers (PrimeNG, Router, Animations)
│   │   │   ├── app.routes.ts                   # Routes: / → page-a, /page-b
│   │   │   ├── services/
│   │   │   │   └── bc-bridge.ts                # BC ↔ Angular bridge service
│   │   │   ├── components/
│   │   │   │   └── nav-bar/                    # PrimeNG Menubar navigation
│   │   │   └── pages/
│   │   │       ├── page-a/                     # Dashboard – editable record form
│   │   │       └── page-b/                     # Details – read-only record viewer
│   │   ├── test-setup.ts                       # Vitest global test setup (matchMedia mock)
│   │   └── styles.scss                         # Global styles (PrimeIcons, reset)
│   ├── scripts/
│   │   └── package-for-bc.mjs                  # Post-build: copies output to AL folder
│   └── angular.json                            # Angular CLI config (inc. "bc" build config)
│
└── AngularApp/           # Business Central AL project
    ├── app.json          # App manifest (ID range 51501–52000)
    └── Src/
        ├── AngularControlAddin/
        │   ├── AngularControlAddIn.ControlAddin.al  # Control addin definition
        │   ├── js/
        │   │   ├── controlAddin-events.js           # BC ↔ Angular event bridge (hand-written)
        │   │   └── angular-addin.js                 # Built Angular bundle (generated)
        │   └── css/
        │       └── angular-addin.css                # Built Angular styles (generated)
        ├── AngularDemoRecord.Table.al               # Demo table (Entry No, Name, Description, Amount)
        ├── AngularDemoList.Page.al                  # List page (ID 51501)
        └── AngularDemoCard.Page.al                  # Card page with TWO control addins (ID 51502)
```

---

## Angular app features

| Feature | Details |
|---|---|
| Framework | Angular 21 (standalone components, signals) |
| UI library | PrimeNG 21 with Aura theme |
| Routing | Hash-based (`#/page-a`, `#/page-b`) – required for BC iframe embedding |
| **Page A** – Dashboard | Editable record form (Name, Description, Amount), Save/Discard/Refresh |
| **Page B** – Details | Read-only record viewer using PrimeNG DataView |
| **NavBar** | PrimeNG Menubar with links to both pages + BC connection indicator |
| BC bridge | `BcBridgeService` – RxJS Subjects expose `record$`, `readOnly$`, `page$`, `connected$` |

---

## BC → Angular data flow

```
AL: CurrPage.AngularAddinA.LoadData('{"name":"...","page":"page-a"}')
  → controlAddin-events.js window.LoadData()
    → CustomEvent 'onBCLoadData'
      → BcBridgeService._record$.next(data)
        → Components update via subscriptions
        → Router navigates to data.page if provided
```

## Angular → BC data flow

```
User clicks "Save to BC" in Page A
  → BcBridgeService.sendDataToBC(record)
    → CustomEvent 'onDataChange'
      → controlAddin-events.js InvokeExtensibilityMethod('OnDataChange', [json])
        → AL trigger OnDataChange fires
          → Rec.Modify(true)
```

---

## Two control addins on the same page

The `Angular Demo Card` (page 51502) demonstrates calling the control addin **twice**:

```al
usercontrol(AngularAddinA; AngularControlAddIn)   // → Page A (Dashboard) by default
usercontrol(AngularAddinB; AngularControlAddIn)   // → Page B (Details) by default
```

Each instance runs in **its own iframe** with an independent Angular runtime.
BC pushes the same record data to both addins with different `page` values:

```al
// Addin A always receives {"name":"...","page":"page-a"}
CurrPage.AngularAddinA.LoadData(DataJson_PageA);

// Addin B always receives {"name":"...","page":"page-b"}
CurrPage.AngularAddinB.LoadData(DataJson_PageB);
```

BC actions on the card page:
- **Toggle Read-Only** – sets read-only on both addins simultaneously
- **Show Dashboard in Both** – calls `SetPage('page-a')` on both addins
- **Show Details in Both** – calls `SetPage('page-b')` on both addins

---

## ID ranges

| App | Range |
|---|---|
| ReactApp | 51000 – 51500 |
| **AngularApp** | **51501 – 52000** |

---

## Local development

### Prerequisites
- Node.js 18+
- Angular CLI 21: `npm install -g @angular/cli`

### Run Angular app standalone (dev server)

```bash
cd angular-app
npm install
npm start
# → http://localhost:4200
```

The app renders with a mock BC bridge. No data will arrive until BC calls `LoadData`.

### Build for Business Central

```bash
cd angular-app
npm run build:bc
```

This:
1. Runs `ng build --configuration=bc` (no hashing, outputs to `AngularApp/Src/AngularControlAddin/dist/`)
2. Runs `node scripts/package-for-bc.mjs` to copy `main.js → js/angular-addin.js` and `styles.css → css/angular-addin.css`

Commit the updated `js/angular-addin.js` and `css/angular-addin.css` files.

### Run tests

```bash
cd angular-app
npm test
```

---

## Business Central deployment

1. Run `npm run build:bc` in `angular-app/`
2. Commit the updated `AngularApp/Src/AngularControlAddin/js/angular-addin.js` and `css/angular-addin.css`
3. Publish the AL app using the AL extension or AL-Go workflow
4. Navigate to **Angular Demo Records** list → open a card to see both Angular addins

---

## Extending

### Add a new page

1. `ng generate component pages/page-c --skip-tests=false`
2. Add route in `app.routes.ts`: `{ path: 'page-c', component: PageC }`
3. Add menu item in `nav-bar.ts`
4. Call `CurrPage.<Addin>.SetPage('page-c')` from AL
