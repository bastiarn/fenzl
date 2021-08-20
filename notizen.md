# Game Logik:

- Spiel Start
  - 0: Random Range wird generiert
  - 1: Random Range wird für 15s angekündigt
  - 2: Warten auf Range-Ausbruch innerhalb Zeitspanne t
    - Option 2.1: Kein Ausbruch
      - Goto 0
    - Option 2.2: Ausbruch
      - Sound & Visueller Alarm
      - Spiel Stop

# GAME STATES:

## STOPPED
- Button zum starten des Spiels

Next State: ANNOUNCEMENT

## ANNOUNCEMENT
- Anzeige der neuen Range
- Anzeige RT-Pegel
- Anzeige Countdown 15s
  
Next State: RUNNING

## RUNNING
- Anzeige der Range
- Anzeige RT-Pegel
- Anzeige Leben

Next Possible State: ANNOUNCEMENT
Next Possible State: LOST

## LOST
- Bild- und Tonalarm

Next State: STOPPED