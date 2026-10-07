# AURORA Frontend — Architecture & Engineering Specification

Bu hujjat `nestar-client` arxitekturasi va kodlash uslubining to'liq tahlili asosida yaratilgan bo'lib, `aurora-next` loyihasini ishlab chiqishda 100% rioya qilinishi shart bo'lgan qoidalar to'plamidir.

---

## 1. LOYIHA FALSAFASI VA ASOSIY QOIDALAR

1. **Next.js Pages Router (14.x)**: App Router ishlatilmaydi. Barcha marshrutlar `pages/` papkasida bo'ladi.
2. **Page → Screen → Section → Component iyerarxiyasi**: Sahifalar bitta ulkan fayl bo'lib ketmasligi kerak. Katta sahifalar mustaqil section komponentlarga bo'linadi.
3. **Layout HOC tizimi**: Har bir sahifa `withLayoutMain`, `withLayoutBasic`, `withLayoutFull` yoki `withAdminLayout` HOC orqali o'raladi.
4. **Desktop va Mobile ajratilishi**: `useDeviceDetect()` orqali `#pc-wrap` va `#mobile-wrap` DOM daraxtlari alohida render qilinadi.
5. **SCSS Arxitekturasi**: CSS Modules, Tailwind yoki CSS-in-JS ishlatilmaydi. An'anaviy modular SCSS iyerarxiyasi ishlatiladi (`scss/pc/` va `scss/mobile/`).
6. **Apollo Client & Reactive Variables**: Global state uchun Redux/Zustand emas, Apollo `makeVar` (masalan, `userVar`, `socketVar`) ishlatiladi.
7. **Filtrlar URL orqali boshqariladi**: Qidiruv va filtrlar holati `router.query` bilan sinxronlanadi.

---

## 2. JILDLAR TUZILISHI (FOLDER STRUCTURE)

```
aurora-next/
├── apollo/                         # Apollo Client, linklar, reaktiv o'zgaruvchilar va operatsiyalar
│   ├── client.ts                   # Apollo Client sozlamalari, authLink, wsLink, uploadLink
│   ├── store.ts                    # makeVar reaktiv o'zgaruvchilari (userVar, socketVar, themeVar)
│   ├── user/                       # Foydalanuvchi GraphQL operatsiyalari
│   │   ├── query.ts                # Foydalanuvchi query'lari
│   │   └── mutation.ts             # Foydalanuvchi mutation'lari
│   └── admin/                      # Admin GraphQL operatsiyalari
│       ├── query.ts                # Admin query'lari
│       └── mutation.ts             # Admin mutation'lari
├── pages/                          # Next.js Pages router sahifalari
│   ├── _app.tsx                    # Root: ApolloProvider, ThemeProvider, global SCSS importlar
│   ├── _document.tsx               # HTML shabloni va shriftlar
│   ├── index.tsx                   # Bosh sahifa (Home)
│   ├── _admin/                     # Admin boshqaruv sahifalari (faqat adminlar uchun)
│   └── [domain]/                   # Domen sahifalari (listing, detail va h.k.)
├── libs/                           # Asosiy kutubxona va komponentlar
│   ├── auth/                       # Autentifikatsiya (JWT token, login, signup, logout)
│   ├── components/                 # React komponentlari
│   │   ├── layout/                 # Layout HOC'lari (LayoutMain, LayoutBasic, LayoutFull, LayoutAdmin)
│   │   ├── common/                 # Umumiy qayta ishlatiladigan kartalar (BigCard, AgentCard va h.k.)
│   │   ├── [domain]/               # Har bir sahifaga xos seksiyalar va komponentlar
│   │   ├── Top.tsx                 # Universal Navbar
│   │   ├── Footer.tsx              # Universal Footer
│   │   └── Chat.tsx                # WebSocket asosidagi suhbat vidjeti
│   ├── types/                      # Qo'lda yozilgan TypeScript interfeyslari (DTO va modellar)
│   ├── enums/                      # Enumlar
│   ├── hooks/                      # Custom hooklar (useDeviceDetect.ts)
│   ├── config.ts                   # Global konfiguratsiya va konstantalar
│   ├── utils.ts                    # Yordamchi funksiyalar (numeral formatlash va h.k.)
│   └── sweetAlert.ts               # Standart SweetAlert2 modal va toast yordamchilari
├── scss/                           # SCSS stillar tizimi
│   ├── app.scss                    # Asosiy resetlar va #pc-wrap .container
│   ├── variables.scss              # Shriftlar va o'zgaruvchilar
│   ├── reset.scss                  # Element resetlari
│   ├── MaterialTheme/              # Material UI mavzu sozlamalari
│   ├── pc/                         # Desktop stillari
│   │   ├── main.scss               # Barcha PC stillarini import qiluvchi markaz
│   │   ├── general.scss            # Umumiy qayta ishlatiladigan karta stillari
│   │   └── [domain]/               # Har bir domen/seksiya stillari
│   └── mobile/                     # Mobile stillari
│       ├── main.scss               # Mobile stillar markazi
│       └── general.scss            # Mobile umumiy kartalar
└── public/                         # Statik fayllar (rasmlar, ikonlar, bannerlar)
```

---

## 3. PAGE → SCREEN → SECTION HIERARCHY

Sahifalar strukturasi qat'iy ravishda 4 qatlamdan iborat bo'ladi:

```
1. ROUTE / PAGE LAYER (pages/)
   - URL va router.query bilan ishlash
   - getStaticProps (tarjimalar uchun)
   - Layout HOC bilan o'ralgan (withLayoutBasic, withLayoutMain)
   ↓
2. SCREEN COMPONENT
   - Asosiy Apollo Query (useQuery)
   - Saralash (sorting) menyusi va holati
   - Paginatsiya holati (total, currentPage)
   - Sektsiyalarni birlashtirish
   ↓
3. SECTION COMPONENTS (libs/components/[domain]/)
   - Filtrlash panellari (Filter.tsx)
   - Karusellar va slayderlar (Swiper)
   - Ro'yxat konteynerlari
   - Har bir seksiya o'ziga tegishli API chaqiruvlari yoki prop handlerlarini qabul qiladi
   ↓
4. SMALL / REUSABLE COMPONENTS (libs/components/common/ yoki domain)
   - Alohida kartalar (Card.tsx)
   - Ikonlar, tugmalar, badjlar
```

---

## 4. KOMPONENTLARNING KODLASH STANDARTI

Har bir komponentda qat'iy tartib va sharhlar bloki (`/** ... **/`) saqlanishi kerak:

```tsx
import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface ComponentProps {
    initialInput: AnyInquiry;
}

const ExampleComponent = (props: ComponentProps) => {
    const { initialInput } = props;
    const device = useDeviceDetect();
    const user = useReactiveVar(userVar);
    const [dataList, setDataList] = useState([]);

    /** APOLLO REQUESTS **/
    const { loading, data, refetch } = useQuery(GET_DATA, {
        fetchPolicy: 'network-only',
        variables: { input: initialInput },
        notifyOnNetworkStatusChange: true,
        onCompleted: (data) => {
            setDataList(data?.getData?.list);
        },
    });

    /** LIFECYCLES **/
    useEffect(() => {
        // mount amallari
    }, []);

    /** HANDLERS **/
    const handleAction = async () => {
        // voqealar
    };

    if (device === 'mobile') {
        return (
            <Stack className="example-mobile">
                {/* Mobile ko'rinishi */}
            </Stack>
        );
    } else {
        return (
            <Stack className="example-desktop">
                {/* Desktop ko'rinishi */}
            </Stack>
        );
    }
};

ExampleComponent.defaultProps = {
    initialInput: {
        page: 1,
        limit: 10,
        sort: 'createdAt',
        direction: 'DESC',
        search: {},
    },
};

export default ExampleComponent;
```

---

## 5. GRAPHQL VA API INTEGRATSIYASI

1. **Apollo Link Zanjiri**:
   - `authLink`: Har bir so'rovga `localStorage`dagi `accessToken`ni `Authorization: Bearer <token>` sifatida ulaydi.
   - `createUploadLink`: Multipart fayllarni yuklashni qo'llab-quvvatlaydi.
   - `wsLink`: Real vaqt WebSocket ulanishi.
   - `errorLink`: Global GraphQL xatolarini ushlab, SweetAlert orqali ko'rsatadi.
2. **So'rovlar Shartnomasi**:
   - Har bir Query bitta `$input: ...Inquiry!` o'zgaruvchisini qabul qiladi.
   - Natija `list` va `metaCounter: [{ total }]` formatida qaytadi.
3. **Refetch Amaliyoti**:
   - Mutation bajarilgandan so'ng murakkab kesh yozish o'rniga tegishli query'ning `refetch()` funksiyasi chaqiriladi.
4. **Fetch Policy**:
   - Listing va o'zgaruvchan sahifalar uchun: `network-only`.
   - Karusel va statikroq bo'limlar uchun: `cache-and-network`.

---

## 6. AUTENTIFIKATSIYA VA AVTORIZATSIYA

1. **Token saqlash**: `localStorage`da `accessToken` kaliti bilan saqlanadi.
2. **Sessiyani tiklash**: Har bir Layout HOC mount bo'lganda (`useEffect`) tokenni o'qiydi, `jwt-decode` orqali dekodlaydi va Apollo reaktiv o'zgaruvchisi `userVar`ni yangilaydi.
3. **Chiqish (Logout)**:
   - `localStorage.removeItem('accessToken')`
   - `userVar`ni tozalash
   - `window.location.reload()`
4. **Sahifa himoyasi**:
   - Foydalanuvchi sahifalari: `if (!user._id) router.push('/')`.
   - Admin sahifalari: `LayoutAdmin` ichida `if (user.memberType !== MemberType.ADMIN) router.push('/')`.

---

## 7. SCSS VA STILLAR ARXITEKTURASI

1. **Kirish nuqtasi**: `_app.tsx` ichida `app.scss`, `pc/main.scss`, `mobile/main.scss` global yuklanadi.
2. **Konteyner kengligi**: `#pc-wrap .container` har doim qat'iy `1300px` bo'lib, `margin: 0 auto` bilan markazlashtiriladi.
3. **Kaskadli Selektor Qoidasi**:
   - Har bir SCSS fayli `#pc-wrap` bilan boshlanadi:
   ```scss
   #pc-wrap {
       #page-id {
           .section-class {
               .element-class {
                   // stillar
               }
           }
       }
   }
   ```
4. **Umumiy kartalar**: `scss/pc/general.scss` faylida saqlanadi (masalan, `.property-big-card-box`, `.agent-general-card`).
5. **Domen stillari**: `scss/pc/[domain]/[section].scss` ichida bo'ladi va `scss/pc/main.scss` orqali import qilinadi.

---

## 8. QILINMASLIGI KERAK BO'LGAN ISHLAR (ANTI-PATTERNS)

- Tailwind CSS, Styled-components yoki CSS Modules aralashtirmaslik.
- O'zboshimchalik bilan Redux yoki ortiqcha Context yaratmaslik; Apollo `userVar` yetarli.
- 600+ qatorli yagona monolit sahifa tuzmaslik; bo'limlarni `libs/components/[domain]/` ostiga ajratish.
- `@ts-ignore` va `any` turlarini tartibsiz ishlatmaslik; aniq DTO turlarini `libs/types/`da belgilash.
- Barcha sahifa stillarini bitta SCSS faylga yig'maslik; domen va seksiyalar bo'yicha ajratish.
