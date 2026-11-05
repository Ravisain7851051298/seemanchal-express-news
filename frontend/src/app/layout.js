import './globals.css';
import ReduxProvider from '../components/providers/ReduxProvider';
import PublicShell from '../components/layout/PublicShell';

export const metadata = {
  title: 'Seemanchal Express | सीमांचल एक्सप्रेस - Voice of the People | सच की निर्भीक आवाज',
  description: 'Seemanchal Express is the premier digital news portal and organization covering Kishanganj, Purnea, Araria, Katihar, Bihar and National news. Voice of the People.',
  keywords: 'Seemanchal Express, सीमांचल एक्सप्रेस, Kishanganj news, Purnea news, Katihar, Araria, Bihar news, National news, Hindi news portal',
  openGraph: {
    title: 'Seemanchal Express | Voice of the People',
    description: 'Seemanchal Express is the premier digital news portal and organization covering Kishanganj, Purnea, Araria, Katihar, Bihar and National news. Voice of the People.',
    url: 'https://seemanchalexpress.in',
    siteName: 'Seemanchal Express',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-red-600 selection:text-white">
        <ReduxProvider>
          <PublicShell>{children}</PublicShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
