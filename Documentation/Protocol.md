# Protocol de testare al  aplicatiei

## Platforme pentru partea de server

Aplicatia ar trebui testata pe toate platformele X64 pe care SDK-ul dotnet core le supporta:

1. Windows
    1. 10
    1. 8
    1. 7
    1. Versiuni mai vechi
1. macOS
1. Linux
    1. RHEL
    1. Ubuntu
        1. 19.04
        1. 18.04
        1. 16.04
    1. Debian
    1. Fedora
        1. 28
        1. 27
    1. CentOS / Oracle
    1. openSUSE Leap
    1. SLES

## Internet browser pentru partea de client

Intrucat aplicatia este una de tip web, ea trebuie testata pe mai multe tipuri si versiuni de internet browsere:

1. Windows
    1. Chrome
    1. FireFox
    1. Edge
    1. InternetExplorer
        1. 11
        1. 10
        1. 9
        1. mai vechi
1. macOS
    1. Chrome
    1. FireFox
    1. Safari

1. Linux
    1. FireFox
    1. Chrome
        1. Debian / Ubuntu
        1. Fedora / openSUSE

1. Mobile (partea de server a aplicatiei nu poate fi rulata pe mobile)
    1. FireFox
    1. Chrome

## Descarcare si rulare pe server

Pe server trebuie mai intai instalat SDK dotnet: [link](https://dotnet.microsoft.com/download/dotnet-core/2.2)

Platformele linux au instructiuni [aici](https://dotnet.microsoft.com/download/linux-package-manager/rhel/sdk-2.2.300)

Descarcarea codului sursa se poate face:

- prin git
  - `git clone https://github.com/isisa-mafia/game`
- sau [de aici](https://github.com/isisa-mafia/game/archive/master.zip)

In cazul descarcarii de pe link, este nevoie si de un tool de dezarhivare de tip zip.

Dupa eventuala dezarhivare, se deschide o consola, se parcurge calea pana la directorul descarcat numit "game" si se introduc urmatoarele comenzi in consola:

```shell
cd MafiaGame
dotnet run
```

Eventualele erori la rulare trebuie documentate.

In cazul rularii fara erori, va aparea in consola un link catrea partea de client a aplicatiei.

## Testarea partii de client

Clientul a fost testat si se comporta bine, fara erori, pe combinatia de server/client Windows 10 / FireFox.
Aceasta cobinatie va fi folosita pentru a compara modul in care apare UI-ul pe alte platforme.

### Script de urmat pentru partea de client

1. Se deschid cel putin 6 ferestre si se urmeaza linkul aplicatiei
1. In fiecare fereastra se apasa butonul "Play" si se introduce un nume aleator
1. In una dintre ferestre se creeaza o noua camera de joc, cu nume aleator
    - in fiecare fereastra trebuie sa apara noua camera de joc in lista de jocuri
    - in dreptul jocului creat trebuie sa apara corect numarul de jucatori "1/5"
1. In alta fereastra se creeaza inca o camera de joc
    - in fiecare fereastra trebuie sa apara noua camera si numarul corect de jucatori
1. Se paraseste prima camera de joc
    - in fiecare fereastra trebuie ca disparitia camerei din lista sa ia loc
1. In una dintre ferestrele ce nu se afla in joc, se intra in jocul ramas
    - in fiecare fereastra trebuie sa apara corect numarul de jucatori "2/5"
1. Se verifica in partea din dreapta ca lista de jucatori din camera sa corespunda cu numele jucatorilor aflati in camera
1. In una dintre ferestrele in care sa intrat in joc, se introduce in partea din drapta jos un mesaj si se trimite
    - trebuie ca mesajul sa apara doar celor 2 jucatori aflati in camera
1. Se folosesc inca 3 ferestre pentru a intra in jocul deja creat
    - in ferestrele ce au intrat in joc trebuie sa apara un mesaj cu titlul "Ready check"
    - se apasa butonul "Ready" in fiecare fereastra
    - in fiecare fereastra trebuie sa se schimbe ecranul si sa se afiseze numele jucatorului
    - doar in una din ferestre trebuie sa apara o lista cu numele jucatorilor din celelalte ferestre si butoane in dreptul fiecarui nume denumite "kill"
    - restul de ferestre ce au intrat in camera au mesajul "You are sleeping" in locul listei
    - ferestrele ce nu se aflau in camera trebuie inca sa vada camera creata in lista de jocuri
1. Se apasa unul dintre butoanele "Kill"
    - in cazul in care jocul nu sa terminat
        - in fiecare fereastra apare in partea din dreapta o lista cu mesaje
        - una dintre ferestre trebuie sa contina mesajul "You are dead"
        - se testeaza faptul ca fiecare jucator inafara de cel cu mesajul "You are dead" poate sa comunice cu ceilalti jucatori
        - cand jucatorul "dead" incearca sa comunice, trebuie sa primeasca in chat mesajul: "GM: dead cannot speak"
        - doar in una din ferestre trebuie sa apara o lista cu numele jucatorilor din celelalte ferestre si butoane in dreptul fiecarui nume denumite "kill"
        - se repeta punctul 10
    - in cazul in care jocul sa terminat
        - unul dintre mesajele "Civilians won" sau "Assassin won" trebuie sa apara pe ecran
1. In fiecare fereastra se apasa butonul "ok"
    - in toate ferestrele trebuie sa se actualizeze lista de camere, acum fiind goala
1. Se actioneaza butonul "GitHub" din dreapta sus in una dintre feresre
    - browserul trebuie sa urmeze link-ul catre <https://github.com/isisa-mafia/game>
1. Se actioneaza butonul "About" din dreapta sus in alta fereastra
    - trebuie sa apara un sub-menu cu optiunile: "Documentation" si "About the game"
1. Se actioneaza butonul "About the game"
    - browserul trebuie sa urmeze link-ul catre <https://en.wikipedia.org/wiki/Mafia_(party_game)>
1. Se actioneaza butonul "About" din dreapta sus in alta fereastra
1. Se actioneaza butonul "Documentation"
    - browserul trebuie sa urmeze link-ul catre <https://github.com/isisa-mafia/game/Documentation>
1. Se actioneaza butonul "MafiaGame" din stanga sus in alta fereastra
    - browserul trebuie sa navigheze inspre pagina de intampinare a aplicatiei

## Documentare buguri

Orice erori aparute in urmarea scriptului trebuie documentate si adaugate in directorul Documentation al [paginii de github al proiectului](https://github.com/isisa-mafia/game/)




