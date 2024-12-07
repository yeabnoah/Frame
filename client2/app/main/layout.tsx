import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "../globals.css";
import NavComponent from "@/components/app/navbar";
import { ThemeProvider } from "next-themes";


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="">
      <head />
      <body className="antialiased flex overflow-x-hidden dark:bg-black bg-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="md:flex md:flex-row flex flex-col dark:bg-black bg-white w-full">
            {/* Desktop Navigation */}
            <div className="md:w-[13vw] hidden md:block border-r border-foreground/10 border-dashed">
              <div className="md:fixed left-[4.5vw] top-0 h-screen flex items-center justify-center">
                <NavComponent variant="desktop" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pb-20 md:pb-0 md:pr-8 w-full max-w-[1400px]">
              {children}
            </div>

            {/* Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
              <NavComponent variant="mobile" />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}