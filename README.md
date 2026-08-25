<div align="center">
  <img src="frontend/public/favicon.svg" width="80" height="80" alt="EduAcademy Logo" />
  <h1>EduAcademy | منصة التعليم الرقمي والتدريب الذكية</h1>
  <p><strong>منظومة تعليمية متكاملة وحديثة تجمع بين تجربة تعلم تفاعلية، استوديو متقدم للمدرسين، ولوحة تحكم إدارية شاملة مع نظام مالي مصري معتمد بالكامل (EGP).</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue?logo=react&style=flat-square" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.2-purple?logo=vite&style=flat-square" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwindcss&style=flat-square" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Laravel-12-red?logo=laravel&style=flat-square" alt="Laravel 12" />
    <img src="https://img.shields.io/badge/Currency-EGP%20(ج.م.)-emerald?style=flat-square" alt="EGP" />
    <img src="https://img.shields.io/badge/i18n-Arabic%20(RTL)%20%7C%20English-amber?style=flat-square" alt="i18n" />
  </p>
</div>

---

## 🌟 نظرة عامة على المشروع (Project Overview)

**EduAcademy** هي منصة تعليم وتدريب إلكتروني متطورة تم بناؤها بأحدث معايير الويب وهندسة البرمجيات لتوفير بيئة تعليمية تفاعلية آمنة وسلسة للطلاب، المدرسين، ومديري النظام.

المنصة تدعم الواجهتين **العربية (RTL)** و **الإنجليزية (LTR)** بالكامل مع تخصيص مالي شامل يعتمد **الجنيه المصري (EGP)** وربط الحسابات والبطاقات البنكية المصرية المعتمدة.

---

## 🚀 الميزات الرئيسية (Core Features)

### 1. 🎓 بوابة وتجربة الطالب (Learner Experience)
- **مشغل دورات تفاعلي (Course Player)**: تشغيل سلس للمحاضرات والفيديوهات، تدوين الملاحظات، والانتقال بين الوحدات.
- **الاختبارات والتقييمات الذكية (Quizzes & Assignments)**: حل الاختبارات ومعرفة النتائج فورياً.
- **شهادات معتمدة دولياً (Verified Certificates)**:
  - إصدار شهادات إتمام معتمدة باللغة الإنجليزية.
  - توقيع يدوي انسيابي فاخر للمدرس (`Handwritten Cursive Signature`).
  - التحقق الفوري من صحة الشهادة عبر الرمز التسلسلي ورمز QR.
- **المشتريات والفواتير الرسمية**: استعراض الفواتير المفصلة القابلة للطباعة والتحميل.
- **قائمة الرغبات والتفضيلات (Wishlist)** وحفظ التقدم التعليمي.

### 2. 👨‍🏫 استوديو وبوابة المدرس (Instructor Studio)
- **منشئ ومحرر الدورات (Curriculum Editor)**: إضافة وتعديل الوحدات والدروس والمرفقات.
- **إدارة وتقييم الطلاب (Grading Queue)**: مراجعة الواجبات ومنح الدرجات والملاحظات.
- **التقارير المالية وكشف الحساب المفصل (Itemized Statement)**:
  - تفاصيل دقيقة للأرباح: (سعر الكورس × عدد المشتركين = الإجمالي − نسبة عمولة المنصة = الصافي).
  - إضافة البطاقة والحساب البنكي المصري وسحب الأرباح بعد موافقة الإدارة (فترة تحويل 7 أيام عمل).
  - حماية وتشفير بيانات البطاقة المصرفية وفق معايير **PCI-DSS Compliant**.

### 3. 🛡️ لوحة التحكم والإدارة الشاملة (Admin Control Center)
- **إدارة المستخدمين والأدوار (Users CRUD)**: إضافة، تعديل، ترقية، وتعطيل الحسابات وتعيين الصلاحيات.
- **اعتماد الحسابات والبطاقات البنكية (`/admin/bank-approvals`)**: تدقيق البطاقات المصرية للمدرسين واعتمادها بنقرة واحدة.
- **مراجعة واعتماد طلبات السحب (`/admin/payouts`)**: فحص طلبات سحب الأرباح، كشف الحساب، وتحويل المستحقات.
- **نظام تذاكر الدعم الفني المتقدم (`/admin/support`)**: استقبال التذاكر، الرد المباشر، وتغيير أولويات وحالات المتابعة.
- **إدارة ومراجعة التقييمات (Reviews Moderation)**: اعتماد أو حذف آراء ومراجعات الدورات.
- **التقارير والتحليلات المالية (`/admin/reports`)**: رسوم بيانية ومؤشرات أداء مالي (KPIs).
- **إعدادات المنصة ونسبة العمولة (`/admin/settings`)**: محاكي حي لتعديل وتطبيق نسب عمولة المنصة.

### 4. 🔔 نظام الإشعارات والتنبيهات الحي (Real-Time Notifications)
- شارات إشعارات تفاعلية متزامنة فورياً مع حالة الطلبات والسحب والدعم الفني والتقييمات.
- ميزة التصفير التلقائي عند المعالجة وزر **"تحديد الكل كمقروء" (Mark All as Read)**.

---

## 🛠️ البنية التقنية (Tech Stack)

### Frontend (الواجهة الأمامية)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System tokens (Dark/Light Modes)
- **State Management**: Zustand (Stores مع LocalStorage Persistence)
- **Routing**: React Router 7
- **Data Fetching & Cache**: TanStack React Query
- **Icons & Typography**: Tabler Icons + Google Fonts (Cairo, Zain, Inter, Outfit, Alex Brush)

### Backend (الخلفية وقواعد البيانات)
- **Framework**: Laravel 12 (PHP 8.2+)
- **API**: RESTful JSON API مع مصادقة آمنة
- **Database**: SQLite / MySQL / PostgreSQL مع Migrations و Seeders جاهزة
- **Architecture**: Domain-Driven Design (DDD) & Service Repositories

---

## 💻 التشغيل والتثبيت المحلي (Getting Started)

### 1. المتطلبات (Prerequisites)
- **Node.js**: `v20.0+`
- **PHP**: `8.2+`
- **Composer**: `v2.0+`

---

### 2. تشغيل الواجهة الأمامية (Frontend)
```bash
# الانتقال لمجلد الواجهة
cd frontend

# تثبيت المكتبات
npm install

# تشغيل خادم التطوير
npm run dev
```
> يعمل التطبيق على: `http://localhost:5173`

---

### 3. تشغيل الواجهة الخلفية (Backend)
```bash
# الانتقال لمجلد الخلفية
cd backend

# تثبيت الحزم
composer install

# إنشاء مفتاح التطبيق وقاعدة البيانات
php artisan key:generate
php artisan migrate --seed

# تشغيل الخادم
php artisan serve
```
> يعمل الـ API على: `http://127.0.0.1:8000`

---

## 📜 الترخيص (License)
هذا المشروع مطور ومخصص لمنظومة التعليم الذكي والتدريب الرقمي الحديث. جميع الحقوق محفوظة © 2026.
