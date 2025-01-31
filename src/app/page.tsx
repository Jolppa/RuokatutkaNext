export default function Page() {
  return (
    <main className="container mx-auto p-8">
      <header>
        <h1 className="text-4xl font-bold mb-6 text-center">
          Tervetuloa Ruokatutkaan
        </h1>
      </header>

      <section className="mb-6" aria-labelledby="what-we-do">
        <h2 id="what-we-do" className="text-2xl font-semibold mb-2">
          Mitä Ruokatutka tekee?
        </h2>
        <p className="text-lg">
          Ruokatutka on sovellus, joka auttaa sinua löytämään
          opiskelijaravintoloiden ruokalistoja Suomen kaupungeissa. Syötä
          haluamasi kaupunki, ja sovellus kerää tiedot{" "}
          <a
            href="https://www.lounaat.info/"
            className="text-sky-500 underline hover:text-sky-700"
            aria-label="lounaat.info-sivuston etusivu"
          >
            lounaat.info-sivustolta
          </a>
          , näyttäen ravintoloiden päivitetyt menut.
        </p>
      </section>

      <section className="mb-6" aria-labelledby="project-purpose">
        <h2 id="project-purpose" className="text-2xl font-semibold mb-2">
          Projektin tausta
        </h2>
        <p className="text-lg">
          Tämä projekti on luotu osoittamaan osaamiseni tietokantojen
          hallinnassa, Next.js:n käytössä sekä yleisesti ohjelmoinnin parissa.
          Suunnittelin ja toteutin Ruokatutkan hyödyntäen PostgreSQL-tietokantaa
          tallentamaan käyttäjien aiempia hakuja ja Next.js:n tarjoamia
          moderneja ominaisuuksia kehittääkseni responsiivisen ja tehokkaan
          sovelluksen.
        </p>
      </section>

      <section className="mb-6" aria-labelledby="how-to-use">
        <h2 id="how-to-use" className="text-2xl font-semibold mb-2">
          Kuinka käyttää sovellusta?
        </h2>
        <ol className="list-decimal list-inside text-lg">
          <li>
            Kirjaudu sisään tai <strong>luo käyttäjätili</strong>.
          </li>
          <li>Syötä haluamasi Suomen kaupunki hakukenttään.</li>
          <li>Valitse kaupungin opiskelijaravintolat luettelosta.</li>
          <li>
            Selataksesi ravintoloiden päivän ruokalistoja, valitse päivämäärä.
          </li>
        </ol>
      </section>

      <footer className="text-center mt-8 text-gray-600">
        © {new Date().getFullYear()} Ruokatutka. Kaikki oikeudet pidätetään.
      </footer>
    </main>
  );
}
