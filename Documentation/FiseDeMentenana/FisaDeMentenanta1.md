# Fisa de mentenanta 1

## Observatii

Datorita testului numarul 1 am aflat ca aplicatia nu functioneaza deloc in cazul browserului InternetExplorer.

In urma investigatiilor se pare ca InternetExplorer nu intelege tehnologia WebSocket dar nici noile versiuni de JavaScript.

## Rezolvare

Pentru a rezolva problema cu WebSockets am folosit libraria SignalR din dotnet, ce permite clientilor mai vechi sa comunice cu serverul prin protocoale mai rudimentare.

Pentru a rezolva problema cu JavaScript am folosit libraria Babel din npm, ce traduce noul dialect de JavaScript intr-o versiune mai veche, inteleasa de majoritatea browserelor.

## Testare

Au fost testate versiunile 11 si 10 de InternetExplorer si, in urma modificarilor, acestea ruleaza perfect aplicatia.

## Concluzii

Versiunile 11 si 10 de InternetExplorer functioneaza asa cum cere protocolul.