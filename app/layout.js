export const metadata = {
  title: 'Caricature de Mariage',
  description: 'Prenez une photo, recevez votre caricature aquarelle !',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily:
            "'Georgia', 'Iowan Old Style', serif",
          background: '#faf6f0',
          color: '#3a3532',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
