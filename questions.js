/**
 * @fileoverview Publicly known oral exam questions for Polish language
 * matura exam (2026–2028), as published by the Central Examination
 * Commission (CKE) on 30 August 2024.
 *
 * Template literals are used throughout to avoid any issues with
 * curly quotation marks (U+201C / U+201D) or apostrophes inside strings.
 *
 * @type {string[]}
 */
const QUESTIONS = [
  // ── Biblia ──────────────────────────────────────────────────────────────
  `Motyw cierpienia niezawinionego. Omów zagadnienie na podstawie znanych Ci fragmentów Księgi Hioba. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Człowiek wobec niestałości świata. Omów zagadnienie na podstawie znanych Ci fragmentów Księgi Koheleta. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Wizja końca świata. Omów zagadnienie na podstawie znanych Ci fragmentów Apokalipsy św. Jana. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Jan Parandowski, Mitologia (cz. I Grecja) ───────────────────────────
  `Poświęcenie się w imię wyższych wartości. Omów zagadnienie na podstawie Mitologii (cz. I Grecja) Jana Parandowskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Problematyka winy i kary. Omów zagadnienie na podstawie Mitologii (cz. I Grecja) Jana Parandowskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Miłość silniejsza niż śmierć. Omów zagadnienie na podstawie Mitologii (cz. I Grecja) Jana Parandowskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Homer, Iliada ────────────────────────────────────────────────────────
  `Heroizm jako postawa człowieka w zmaganiu się z losem. Omów zagadnienie na podstawie znanych Ci fragmentów Iliady Homera. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Sofokles, Antygona ───────────────────────────────────────────────────
  `Prawa boskie a prawa ludzkie. Omów zagadnienie na podstawie Antygony Sofoklesa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Człowiek wobec przeznaczenia. Omów zagadnienie na podstawie Antygony Sofoklesa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Lament świętokrzyski ─────────────────────────────────────────────────
  `Motyw cierpiącej matki. Omów zagadnienie na podstawie znanych Ci fragmentów Lamentu świętokrzyskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Rozmowa Mistrza Polikarpa ze Śmiercią ───────────────────────────────
  `Motyw tańca śmierci. Omów zagadnienie na podstawie znanych Ci fragmentów Rozmowy Mistrza Polikarpa ze Śmiercią. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Pieśń o Rolandzie ────────────────────────────────────────────────────
  `Średniowieczny wzorzec rycerza. Omów zagadnienie na podstawie znanych Ci fragmentów Pieśni o Rolandzie. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── William Szekspir, Makbet ─────────────────────────────────────────────
  `Moralna odpowiedzialność za czyny. Omów zagadnienie na podstawie Makbeta Williama Szekspira. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Czy człowiek decyduje o własnym losie? Omów zagadnienie na podstawie Makbeta Williama Szekspira. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Jaki wpływ na człowieka ma sprawowanie przez niego władzy? Omów zagadnienie na podstawie Makbeta Williama Szekspira. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Molier, Skąpiec ──────────────────────────────────────────────────────
  `Czy dobra materialne czynią człowieka szczęśliwym? Omów zagadnienie na podstawie Skąpca Moliera. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Przyczyny nieporozumień między rodzicami a dziećmi. Omów zagadnienie na podstawie Skąpca Moliera. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Ignacy Krasicki ──────────────────────────────────────────────────────
  `Wady ludzkie w krzywym zwierciadle satyry. Omów zagadnienie na podstawie znanej Ci satyry Ignacego Krasickiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Adam Mickiewicz, Romantyczność i ballady ─────────────────────────────
  `Świat ducha a świat rozumu. Omów zagadnienie na podstawie Romantyczności Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Na czym polega ludowa sprawiedliwość? Omów zagadnienie na podstawie znanych Ci ballad Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Adam Mickiewicz, Dziady część III ───────────────────────────────────
  `Losy młodzieży polskiej pod zaborami. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Mesjanizm jako romantyczna idea poświęcenia. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Postawy społeczeństwa polskiego wobec zaborcy. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Różne postawy człowieka wobec Boga. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Jakie prawdy o człowieku ujawniają jego sny albo widzenia? Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `W jakim celu twórca nawiązuje do motywów biblijnych? Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Walka dobra ze złem o duszę ludzką. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Czym dla człowieka może być wolność? Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Motyw samotności. Omów zagadnienie na podstawie Dziadów części III Adama Mickiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Bolesław Prus, Lalka ─────────────────────────────────────────────────
  `Miłość – siła destrukcyjna czy motywująca do działania? Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Praca jako pasja człowieka. Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Jaką rolę w relacjach międzyludzkich odgrywają majątek i pochodzenie? Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Konfrontacja marzeń z rzeczywistością. Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Miasto – przestrzeń przyjazna czy wroga człowiekowi? Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Czym dla człowieka mogą być wspomnienia? Omów zagadnienie na podstawie Lalki Bolesława Prusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Henryk Sienkiewicz, Potop ────────────────────────────────────────────
  `Postawy odwagi i tchórzostwa. Omów zagadnienie na podstawie znanych Ci fragmentów Potopu Henryka Sienkiewicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Fiodor Dostojewski, Zbrodnia i kara ─────────────────────────────────
  `Walka człowieka ze swoimi słabościami. Omów zagadnienie na podstawie Zbrodni i kary Fiodora Dostojewskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Motyw winy i kary. Omów zagadnienie na podstawie Zbrodni i kary Fiodora Dostojewskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Ile człowiek jest gotów poświęcić dla innych? Omów zagadnienie na podstawie Zbrodni i kary Fiodora Dostojewskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Co może determinować ludzkie postępowanie? Omów zagadnienie na podstawie Zbrodni i kary Fiodora Dostojewskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Motyw przemiany bohatera. Omów zagadnienie na podstawie Zbrodni i kary Fiodora Dostojewskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Stanisław Wyspiański, Wesele ─────────────────────────────────────────
  `Co utrudnia porozumienie między przedstawicielami różnych grup społecznych? Omów zagadnienie na podstawie Wesela Stanisława Wyspiańskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Rola chłopów i inteligencji w sprawie niepodległościowej. Omów zagadnienie na podstawie Wesela Stanisława Wyspiańskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Sen o Polsce czy sąd nad Polską? Omów zagadnienie na podstawie Wesela Stanisława Wyspiańskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Symboliczne znaczenie widm i zjaw. Omów zagadnienie na podstawie Wesela Stanisława Wyspiańskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Motyw tańca. Omów zagadnienie na podstawie Wesela Stanisława Wyspiańskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Władysław Stanisław Reymont, Chłopi ─────────────────────────────────
  `Obyczaj i tradycja w życiu społeczeństwa. Omów zagadnienie na podstawie znanych Ci fragmentów Chłopów Władysława Stanisława Reymonta. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Stefan Żeromski, Przedwiośnie ────────────────────────────────────────
  `Jakie znaczenie ma tytuł dla odczytania sensu utworu? Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Wojna i rewolucja jako źródła doświadczeń człowieka. Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Różne wizje odbudowy Polski po odzyskaniu niepodległości. Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Młodość jako czas kształtowania własnej tożsamości. Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Rola autorytetu w życiu człowieka. Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Utopijny i realny obraz rzeczywistości. Omów zagadnienie na podstawie Przedwiośnia Stefana Żeromskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Witold Gombrowicz, Ferdydurke ────────────────────────────────────────
  `Groteskowy obraz świata. Omów zagadnienie na podstawie znanych Ci fragmentów Ferdydurke Witolda Gombrowicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Człowiek wobec presji otoczenia. Omów zagadnienie na podstawie znanych Ci fragmentów Ferdydurke Witolda Gombrowicza. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Tadeusz Borowski, Proszę państwa do gazu ────────────────────────────
  `"Człowiek zlagrowany" jako ofiara zbrodniczego systemu. Omów zagadnienie na podstawie utworu Proszę państwa do gazu Tadeusza Borowskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Gustaw Herling-Grudziński, Inny świat ───────────────────────────────
  `Jakie znaczenie ma tytuł dla odczytania sensu utworu? Omów zagadnienie na podstawie znanych Ci fragmentów Innego świata Gustawa Herlinga-Grudzińskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Konsekwencje zniewolenia człowieka. Omów zagadnienie na podstawie znanych Ci fragmentów Innego świata Gustawa Herlinga-Grudzińskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Hanna Krall, Zdążyć przed Panem Bogiem ──────────────────────────────
  `Czy możliwe jest zachowanie godności w skrajnych sytuacjach? Omów zagadnienie na podstawie Zdążyć przed Panem Bogiem Hanny Krall. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Zagłada z perspektywy świadka i uczestnika wydarzeń w getcie. Omów zagadnienie na podstawie Zdążyć przed Panem Bogiem Hanny Krall. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Walka o życie z perspektywy wojennej i powojennej. Omów zagadnienie na podstawie Zdążyć przed Panem Bogiem Hanny Krall. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Albert Camus, Dżuma ──────────────────────────────────────────────────
  `Co skłania człowieka do poświęceń? Omów zagadnienie na podstawie Dżumy Alberta Camusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Człowiek wobec cierpienia i śmierci. Omów zagadnienie na podstawie Dżumy Alberta Camusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Czy możliwa jest przyjaźń w sytuacjach skrajnych? Omów zagadnienie na podstawie Dżumy Alberta Camusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Jakie postawy przyjmuje człowiek wobec zła? Omów zagadnienie na podstawie Dżumy Alberta Camusa. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── George Orwell, Rok 1984 ──────────────────────────────────────────────
  `Czy możliwe jest zbudowanie doskonałego państwa? Omów zagadnienie na podstawie utworu Rok 1984 George'a Orwella. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Jak zachować wolność w państwie totalitarnym? Omów zagadnienie na podstawie utworu Rok 1984 George'a Orwella. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Znaczenie propagandy w państwie totalitarnym. Omów zagadnienie na podstawie utworu Rok 1984 George'a Orwella. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Nowomowa jako sposób na ograniczenie wolności człowieka. Omów zagadnienie na podstawie utworu Rok 1984 George'a Orwella. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Sławomir Mrożek, Tango ───────────────────────────────────────────────
  `Bunt przeciwko porządkowi społecznemu. Omów zagadnienie na podstawie Tanga Sławomira Mrożka. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Konflikt pokoleń. Omów zagadnienie na podstawie Tanga Sławomira Mrożka. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  `Normy społeczne – ograniczają człowieka czy porządkują życie? Omów zagadnienie na podstawie Tanga Sławomira Mrożka. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Marek Nowakowski, Górą "Edek" ───────────────────────────────────────
  `W jakim celu autor nawiązuje w swoim tekście do innego tekstu? Omów zagadnienie na podstawie utworu Górą "Edek" Marka Nowakowskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Andrzej Stasiuk, Miejsce ─────────────────────────────────────────────
  `Miejsca ważne w życiu człowieka. Omów zagadnienie na podstawie Miejsca Andrzeja Stasiuka. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Olga Tokarczuk, Profesor Andrews w Warszawie ────────────────────────
  `Stan wojenny z perspektywy obcokrajowca. Omów zagadnienie na podstawie utworu Profesor Andrews w Warszawie Olgi Tokarczuk. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,

  // ── Ryszard Kapuściński, Podróże z Herodotem ────────────────────────────
  `Czym dla człowieka może być podróżowanie? Omów zagadnienie na podstawie znanych Ci fragmentów Podróży z Herodotem Ryszarda Kapuścińskiego. W swojej odpowiedzi uwzględnij również wybrany kontekst.`,
];