  Dialogue service
  Description: This service parses "Yarn" formatted JSON.

  Special tags:
    - 'p-' for portraits
    - 'n-' for name
    - 'i-' to push item to app.stateManager.inv
    - 'rm-' to remove item from app.stateManager.inv
    - 'a-' for portrait animations
    - 'music-' - crossfade to specified track
    - 'sound-' - play sound effect
    - 'event-' - fire event registered to state
    - 'next-' - for next dialogue element if no choices available
    - 'set-' - set values in app.stateManager.invEval
      - set: 'set-name=dee' // app.stateManager.invEval.name === 'dee'
      - increment: 'set-value+=5' // app.stateManager.invEval.value += 5
      - decrement: 'set-value-=5' // app.stateManager.invEval.value -= 5

  Conditional shortcode:
    - highlight text
      - <<highlight-r>>red<</highlight>>
      - <<highlight-y>>yellow<</highlight>>
      - <<highlight-g>>green<</highlight>>
    - show value of key in app.stateManager.inv
      - <<$key>>
    - show dialogue segment if $item(s) exist(s) in app.stateManager.inv
      - <<if $inventoryObject>><</if>>
      - conditional `and` (e.g. if inventoryObject and inventoryObject2):
        - <<if $inventoryObject1&&inventoryObject2>><</if>>
      - conditional `or` (e.g. if inventoryObject or inventoryObject2)::
        - <<if $inventoryObject1||inventoryObject2>><</if>>
    - hide dialogue segment if $item exists in app.stateManager.inv
      - <<hideif $tester>>This vignette is under construction.<</hideif>>
    - show dialogue segment if $item evaluates to a given value in app.stateManager.invEval
        - <<if $inventoryObject=1>><</if>>
        - <<if $inventoryObject>1>><</if>>
        - <<if $inventoryObject<1>><</if>>

    Special followups:
    - 'endtomap' - exit to the map module
    - 'end' - end dialogue after choice selection

    Choices:
      - Choices should be wrapped in two square brackets with a single pipe
        seperating the choice text from the title of the element to which it links
          - [[Photo of you and Million|look-photographs]]

    Choice styles:
      - New choices will be styled with the "unselectedchoice" style. Selected
        styles will be styled with the "selectedchoice" style.
      - A choice will be styled with "unselectedstyle" regardless of whether
        or not it has been selected if:
          - It appears in an an unanimated (i.e. menu) dialogue
          - It belongs to an element with an ID that begins with "use"
          - It belongs to an element with an ID that begins with "move"
          - It is a member of the dialogueConfig.keywords list
            (['look', 'move', 'use', 'leave'])

    Sample element:
    {
      "title": "look",
      "tags": "",
      "body": "<<hideif $look-room>>[[Room|look-room]]<</hideif>>\n" +
              "<<if $bedroom_look_photographs=1>>" +
              "[[Photographs|look-photographs]]<</if>>\n" +
              "<<if $bedroom_look_photographs=2>>" +
              "[[Photo of you and Million|look-photographs]]<</if>>\n" +
              "<<if $look-room>>[[Computer|look-computer]]<</if>>\n" +
              "<<if $look-room>>[[Telephone|look-phone]]<</if>>\n" +
              "<<if $look-room>>[[Window|look-window]]<</if>>",
      "position": {
        "x": -887,
        "y": 194
      },
      "colorID": 0
    }
