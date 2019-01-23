# vsm-box

<br>

## Intro

This component is in development.

See a working prototype on the VSM-pages' [examples page](http://scicura.org/vsm/examples.html). &lt;---

<br>
<br>
<br>

## VSM-sentence data model

A VSM-sentence is represented as an Object with a `terms` and a `conns` property,
which represent VSM-terms and VSM-connectors respectively:  
`{ terms:.., conns:.. }`

<br>

### VSM-term data model

There are several types of VSM-terms. Each one is represented by an Object
with certain properties, from which its type can be inferred.  

For example, the most common type is an 'Instance'-term, which may look like:  
`{ str:.., style:.., descr:.., dictID:.., classID:.., instID:.. }`  

These are all the VSM-term types:

| Type               | Required properties               | Optional properties           | Optional properties 2                       |
|--------------------|-----------------------------------|-------------------------------|---------------------------------------------|
| Literal            | str                               | isFocal, style                | minWidth, maxWidth, editWidth, queryOptions |
| Class              | str, classID                      | isFocal, style, dictID, descr | minWidth, maxWidth, editWidth, queryOptions |
| Instance           | str, classID, instID              | isFocal, style, dictID, descr | minWidth, maxWidth, editWidth, queryOptions |
| Referring instance | str, classID, instID, parentID    | isFocal, style, dictID, descr | minWidth, maxWidth, editWidth, queryOptions |
| Edit-Instance      | (none)                            | isFocal                       | minWidth, maxWidth, editWidth, queryOptions |
| Edit-Class         | type `: 'EC'`                     | isFocal                       | minWidth, maxWidth, editWidth, queryOptions |
| Edit-Literal       | type `: 'EL'`                     | isFocal                       | minWidth, maxWidth, editWidth, queryOptions |
| Edit-Referring*    | type `: 'ER'`                     | isFocal                       | minWidth, maxWidth, editWidth, queryOptions |

Notes:
+ About `classID`, for **Instance** and **Class** terms (_for Referring Terms,
  see later_):
  + The `classID` of a VSM-term corresponds to the `id` of an entry from a
    VSM-dictionary.
  + In a setup that allows users to create new a concept/class on-the-fly,
    i.e. before that class is stored in a database, and thus before it has a
    stored & referable `classID`:  
    only in such a setup, such a term's `classID` may be `null`
    during VSM-sentence construction.
+ About `instID` (only for **Instance** and **Referring** terms):
  + An Instance/Referring term's `instID` is `null` (but not absent) in a
    VSM-sentence that has not been saved yet in some database.  
  + After it has been saved, the database should provide the `instID` it
    created for each VSM-term.  
  + A VSM-term's `instID` can then be used to refer to it as a parent term,
    also from other VSM-sentences.
  + Note on `instID` conservation:
    when a user edits an already-stored VSM-sentence, and changes a term's type
    from Inst. to Ref. or vice versa (i.e. without replacing it with a new term
    via autocomplete), then the vsm-box reports the term with the same `instID`
    (only its `parentID` and maybe `classID` would change).
+ About both `parentID` and `classID`, for **Referring** terms:
  + They are both `null` (but not absent) until the Referring term has been
    connected to a 'parent term'.  
    I.e. they are `null` during VSM-sentence construction, as long as the term
    is not connected to a parent term through the presence of a
    reference-connector,
    nor by it referring to the ID of some term in another VSM-sentence.
  + When it is connected to a parent term that was not stored yet (i.e. in the
    same, under-construction VSM-sentence), and so that parent still has a
    `null` `instID`, then the Referring term's `parentID` is `null` too.  
    In that case, its `classID` will be the same as its parent's `classID`.
  + When it is connected to a parent term that has been stored (and thus
    has a known `instID` and `classID`),  
    then the Referring term's `parentID` and `classID` are equal to its parent's
    `instID` and `classID` resp.
  + <span style="font-size: smaller"> (Implementation notes):  
    &bull; The above describes how a vsm-box's `classID` and `parentID` are
    presented to the outside world, i.e. the way it emits its current state.  
    &bull; Internally, however, an unconnected Referring term's `classID` may
    be not-`null`, e.g. if it was an Instance term before but it was changed to
    a Ref. term. Because then, if the user would decide to change it back to
    Inst. type, it can be restored with its original not-`null` `classID`.  
    &bull; Also, when a Referring term refers to a term in another (or same),
    stored VSM-sentence, then both its `parentID` (==external parent's `instID`)
    and its `classID` (==external parent's `classID`) will keep their non-`null`
    value, internally.
    This is kept so, internally, even if it is changed to or back from other
    term types, or if it would be connected and then unconnected by a
    Reference-connector to a different term, in the same sentence. But it is
    emitted correctly, according to its current type and connection state.  
    </span>
+ A single one of the VSM-terms in a VSM-sentence may have an `isFocal: true`
  property, to indicate that it is the sentence's head (= focal term).
+ The optional `style` property is used to apply custom styling to `str` (e.g.
  to stylize parts of `str` in superscript, in a charged ion's name);
  see [`string-style-html`](https://github.com/vsmjs/string-style-html).
+ A Class/Instance/Referring-term's properties `dictID` and `descr` are optional.
  They are used to make extra information about the VSM-term available, as soon
  as its VSM-sentence gets loaded into a new user-interface component.
+ The four Edit-type term types are empty fields that a user can fill in,
  to generate a meaning- or text-containing VSM-term.  
  The default type is Edit-Instance (or called Editable-Instance, or Edit-type).
  + The four Edit-type terms enable a user to enter or generate an
    Instance/Class/Literal/Referring-type VSM-term in its place, respectively.
  + The user can also switch any non-Edit-type term back to its Editable
    counterpart.
  + *: (An Edit-Referring-type term is likely not useful in a VsmBox's 
    `initialValue` prop, but exists so that the VsmBox can support the editing
    of Referring-type terms too).  
  + Edit-Instance and Edit-Class terms use a VsmAutocomplete component
    for term+ID lookup.  
    Edit-Literal and Edit-Referring terms, however, use a plain
    HTML-&lt;input&gt; field for input. Because:
    + Edit-Literal has no classID, it is just a plain text string.
    + Edit-Referring inherits its classID from its parent term, so the only
      part of it that may be edited, is its string label.  
      E.g. a user could replace a Referring term's label "it" by "the dog"
      for clarity, to create an easy-to-read VSM-sentence.
  + The 'endTerm' (see later) is an Edit-type term as well.
  + (Implementation note: internally, the Edit-Instance term gets an 'EI' `type`,
    and non-Edit terms get 'L'/'C'/'I'/'R' types resp. But for efficiency
    this does not need to given to VsmBox, nor is it emitted in `change` events).
+ `minWidth` and `maxWidth` define a term's content's minimum required and
  maximum allowed display-width, in pixels.
  `editWidth` is the width while it is being edited.
  + If a term has no `maxWidth` property, then `sizes.defaultMaxWidth` is used.  
  + If an Edit-type term has no `editWidth` property or it is 0, then
    `sizes.defaultEditWidth` is used.
  + These widths pertain to a term's string-content only. A term's total width
    will include its padding and border in addition.
  + An external CSS declaration could set a VsmBox's font-size to larger than
    the default font-size, and then the min/max/..Widths would accomodate less
    text than intended.  
    Therefore, `sizes.widthScale` controls scaling to adjust for a different
    font size.
    + For example, VsmBox's default font-size is currently 11px. If external CSS
      sets it to 22px, then min/max/edit/default...Width will accomodate half as
      much text. Then, by setting `sizes.widthScale` to 2, these widths will be
      scaled to twice as wide, and hold just as much text as in the 11px case.
    + + If `sizes.widthScale` is left to its default value of `false`, then it
        will be automatically calculated (replaced by a number) based on
        currently active `.term`-CSS.
      + If set to `1`, no scaling happens.
      + If set to a number different than `1`, that scale will be used instead
        of auto-scaling.
+ The `queryOptions` property is used by a VSM-term's autocomplete, when it
  sends a query to `VsmDictionary.getMatchesForString()`.  
  (See also [`vsm-dictionary`](https://github.com/vsmjs/vsm-dictionary)'s
  [`spec`](https://github.com/vsmjs/vsm-dictionary/blob/master/Dictionary.spec.md),
  in particular for `getEntryMatchesForString()` and `getMatchesForString()`).  
  Used with VSM-templates (see an example further below), this enables
  targeted term-lookup, customizable per Edit-type term.  
  These properties may also be stored in VSM-sentences that were built with a
  VSM-template, so that they can use the same query-options when being re-edited.  
  `queryOptions` accepts these optional sub-prop.s, as defined in vsm-dictionary:
  + `filter`: {Object}:
    + `dictID`: {Array(String)}:  
      a list of dictIDs. It returns only for these, combined in OR-mode.
  + `sort`: {Object}:
    + `dictID`: {Array(String)}:  
      sorts matches whose dictID is in this list, first; then sorts as usual.
      This enables defining 'preferred dictionaries'.
  + `idts`: {Array(Object)}: a list of "fixedTerms", represented by a
    classID + optional term-string: `[{ id:.., str:.. },  ...]`.  
    Note: fixedTerms appear on top of the VSM-term's autocomplete result list,
    and already appear when the term is focused and has no text input yet.  
  + `z`: {true|Array(String)}: to include a full, partial, or no z-object.

<br>

### VSM-connector data model

There are three main types of VSM-connectors: the trident (with 3 dident
subtypes based on which 'leg' is omitted), the list, and the reference connector,
which look like:

| Type                  | Format                              |
|-----------------------|-------------------------------------|
| Trident               | `{ type: 0, pos: [.., .., ..] }`    |
| - Dident, no subject  | `{ type: 0, pos: [-1, .., ..] }`    |
| - Dident, no relation | `{ type: 0, pos: [.., -1, ..] }`    |
| - Dident, no object   | `{ type: 0, pos: [.., .., -1] }`    |
| List-connector        | `{ type: 1, pos: [.., .....] }` |
| Reference-connector   | `{ type: 2, pos: [.., ..] }`        |

Notes:
+ For tridents, the `pos` array tells the index of the referred-to subject-,
  relation-, and object-term, respectively.
+ For didents, the `-1` tells which term it omits.
+ A list-connector's `pos` array can have any length >= 2.
+ A reference-connector's `pos` array tells the index of 0: child, and 1: the
  parent (=referred-to) term, respectively.

<br>

### Data example: unsaved VSM-sentence

Below is an example that represents:
'John eats burnt chicken and salad perforated-by
it<span style="font-size: smaller">(&rarr;that-chicken)</span> with fork'.

```
var vsmSentence = {
  terms: [
    { str: 'John',          classID: 'EX:01', instID: null },
    { str: 'eats',          classID: 'EX:02', instID: null },
    { str: 'burnt',         classID: 'EX:03', instID: null },
    { str: 'chicken',       classID: 'EX:04', instID: null },
    { str: 'and',           classID: 'EX:05', instID: null },
    { str: 'salad',         classID: 'EX:06', instID: null },
    { str: 'perforated by', classID: 'EX:07', instID: null },
    { str: 'it',            classID: 'EX:04', instID: null, parentID: null },
    { str: 'with',          classID: 'EX:08', instID: null },
    { str: 'fork',          classID: 'EX:09', instID: null }
  ],
  conns: [
    { type: 0, pos: [0, 1, 4] },   // = 0 (subject):  John
                                   //   1 (relation): eats
                                   //   4 (object):   and(-combination-of-things)
    { type: 0, pos: [3, -1, 2] },  // = chicken  [is-specified-to-be]  burnt
    { type: 1, pos: [4, 3, 5] },   // = and(-list-of:)  chicken  salad
    { type: 0, pos: [5, 6, 7] },   // = salad  is-perforated-by  'it'
    { type: 0, pos: [1, 8, 9] },   // = eats  with  fork
    { type: 2, pos: [7, 3] }       // = it  ->  chicken
  ]
};
```

Notes:
+ This is a sentence that is not yet stored in a database, so its has `null` for
  its `instID`s.
+ It uses example `classID`s from an imaginary VsmDictionary,
+ It is a minimal example that does not include the optional properties `dictID`
  or `descr`.

<br>

### Data example: stored VSM-sentence

After saving this VSM-sentence in a database, and updating it with the
stored `instID`s that are returned, it may look like (with example `instID`s):

```
var vsmSentence = {
  terms: [
    { str: 'John',          classID: 'EX:01', instID: 'myDB:10051' },
    { str: 'eats',          classID: 'EX:02', instID: 'myDB:10052' },
    { str: 'burnt',         classID: 'EX:03', instID: 'myDB:10053' },
    { str: 'chicken',       classID: 'EX:04', instID: 'myDB:10054' },
    { str: 'and',           classID: 'EX:05', instID: 'myDB:10055' },
    { str: 'salad',         classID: 'EX:06', instID: 'myDB:10056' },
    { str: 'perforated by', classID: 'EX:07', instID: 'myDB:10057' },
    { str: 'it',            classID: 'EX:04', instID: 'myDB:10058', parentID: 'myDB:10054' },  // parentID is same as chicken's instID.
    { str: 'with',          classID: 'EX:08', instID: 'myDB:10059' },
    { str: 'fork',          classID: 'EX:09', instID: 'myDB:10060' }
  ],
  conns: [
    { type: 0, pos: [0, 1, 4] },
    { type: 0, pos: [3, -1, 2] },
    { type: 1, pos: [4, 3, 5] },
    { type: 0, pos: [5, 6, 7] },
    { type: 0, pos: [1, 8, 9] },
    { type: 2, pos: [7, 3] }
  ]
};
```


<br>

### Data example: VSM-template

A template contains Edit-type terms. And any non-Edit-type term's `instID` will
be `null`.  

The following template corresponds to: "... eats ... with ...", with three empty
fields.  

The template's third Edit-type term illustrates:
- a custom `editWidth`, which overrides `sizes.defaultEditWidth`, e.g. to
  accomodate entering a term that is expected to be much longer than usual;
- a `sort` to make this VSM-term's autocomplete rank results from
  subdictionaries with dictID 'EX' or 'EX22' on top;  
  (note: if `filter` is used instead, it limits results to those dictIDs only);
- one fixedTerm: the 'fork' from the above examples.  
  (A fixedTerm appears on top in autocomplete, even without typing anything yet).

```
var vsmSentence = {
  terms: [
    { },
    { str: 'eats', classID: 'EX:02', instID: null, dictID: 'EX', descr: 'to eat' },
    { },
    { str: 'with', classID: 'EX:08', instID: null, dictID: 'EX', descr: 'using' },
    { editWidth: 200, queryOptions:
      { sort: { dictID: ['EX', 'EX22'] }, idts: [{ id: 'EX:09', str: 'fork' }] }
    }
  ],
  conns: [
    { type: 0, pos: [0, 1, 2] },
    { type: 0, pos: [1, 3, 4] }
  ]
};
```

<br>

## Subcomponents: tree overview

This is the structure of `vsm-box`, in terms of its subcomponents:

```
VsmBox
├─┬ TheConns
│ └── Conn      (multiple ones)
└─┬ TheTerms
  ├── Term      (multiple ones, plus endTerm)
  └── ThePopup  (only 1 or 0)
```

+ Notes:  
  + Each VSM-term is represented by a '`Term`' component in the implementation,
    and we will call it a Term from now on.
  + There is an additional 'Term' component at the end, which we call the
    _'endTerm'_.  
    It behaves just like an Edit-type Term, except that it has an invisible
    border when not mouse-hovered, and it is used to create/append new Terms
    to a VSM-sentence.  

<br>
<br>

## VsmBox's props (=attributes)

- `initial-value`: {Object}:  
  a VSM-sentence data Object (see above).  
- `vsm-dictionary`: {Object}:  
  the [`vsm-dictionary`](https://github.com/vsmjs/vsm-dictionary) subclass that
  will be used by this VsmBox's
  [`vsm-autocomplete`](https://github.com/vsmjs/vsm-autocomplete) component.
- `autofocus`: {Boolean} (default `false`):  
  given as prop to VsmAutocomplete,
  see [`there`](https://github.com/vsmjs/vsm-autocomplete).
- `placeholder`: {String|Boolean}:  
  given as prop to VsmAutocomplete.
- `max-string-lengths`: {Object}:  
  given as prop to VsmAutocomplete:  
  limits the string-length of match-items in autocomplete's selection panel.
- `fresh-list-delay`: {Number} (default: a few 100):  
  given as prop to VsmAutocomplete:  
  the small delay (in ms) between when autocomplete's selection-list updates,
  and when the user can select an item from it again (to prevent mis-selection).
- `custom-item`: {Function|false} (default `false`):  
  given to VsmAutocomplete as its prop `custom-item`:  
  a function to customize an autocomplete's selection-panel items' different
  parts.
- `custom-item-literal`: {Function|false} (default `false`):  
  given to VsmAutocomplete as its prop `custom-item-literal`:  
  a function to customize VsmAutocomplete's 'item-literal', if present.
- `allow-class-null`: {Boolean}:  
  tells if users are allowed to create new, ad-hoc general concepts; i.e.
  terms which do not yet have a `classID` in any database or official vocabulary.  
  In other words: it tells if users may create Instance/Class terms with `null`
  for  `classID`.
  + If `false`, users can only add VSM-terms based on existing terms&IDs,
    which are already well-defined and stored in some DB/vocabulary/ontology.
  + If `true`, users can use the item-literal in the VsmAutocomplete result list
    (perhaps even via `advanced-search`, see below) to create VSM-terms with a
    `null` `classID`.  
    + This enables a VsmBox to be used more easily in an environment
      where vocabularies still have many missing concepts, and whereby users
      would frequently need to suggest new terminology.
    + When storing the final VSM-sentence in a database system, that system
      should provide all such terms with a newly generated `classID`;
      (and such newly created concepts/IDs should be immediately reusable in
      subsequently returned autocomplete-results).  
    + Note: for best practice, such created concepts would typically need some
      cleanup before someone should eventually integrate them into a
      well-designed terminology list.
  + Note: if, under `allowClassNull == false`, the `initialValue.terms` data
    contains some `classID == null` Instance or Class terms,  
    then VsmBox will give _no_ notification about this.
    It will simply work with the given data and emit-'change' such existing
    terms as they were received.  
    Note that Referring-type terms will have `null` `classID`s as long as they
    are not connected to a parent term (e.g. while the user builds a
    VSM-sentence, or in some VSM-templates).
- `advanced-search (data, cb)`: {Function|false}:  
  If given, this function will be called when the user selects the 'item-literal'
  at the bottom of a VsmAutocomplete result list.  
  + The intention is that it creates and shows a dialog panel where the user
    has access to more advanced search functionality (or even term management
    functionality), more than just simple autocomplete.  
    This could include customizable search criteria (e.g. dictionary selection),
    or multi-page search-result navigation.  
  + When the user selects a term + linked ID from such a dialog panel,
    it should return this with a single call to `cb`, and hide the panel.  
    VsmBox will then respond in the same way as when the user selects an item
    in a VsmAutocomplete result list.
  + If the VsmBox's particular VsmDictionary supports it, this dialog could
    enable the user to create a new term/concept, store it in a particular
    sub-dictionary, and then select the new concept for immediate use.  
    Or it could let the user create a new term/concept, without storing it yet,
    but it could already let the user suggest a `dictID` and `descr` for it
    (so, keeping `classID==null`, e.g. until the full VSM-sentence is stored)
    (only supported if `allowClassNull==true`, see above).
  + Arguments:
    + `data`: {Object}: a collection of data used by the Edit-Term on which
      advancedSearch is called, and that can also be used by the dialog
      component. Properties:
      + `str`: {String}: contents of the input (what the user typed so far
        in the Edit-type VSM-term);
      + `termType`: the type of Term that would be expected to be created, based
        on the Edit-Term. E.g. for an Edit-Class Term ('EC') this would be 'C'.  
        So, one of: `'R'`, `'I'`, `'C'`, `'L'`.  
        Note: this is just for information. The callback may return a different
        `termType`, which in the end determines the generated Term's type.
      + `vsmDictionary`: {Object}: the VsmDictionary given to this VsmBox,
        and in which should be searched;
      + `queryOptions`: {Object}: as described earlier;
      + `allowClassNull`: {Boolean}: as described earlier.
    + `cb(match)`: {Function}: returns what the user selected in the dialog.
      Arguments:
      + `match`: {Object|false}: it should be one of:  
        + `false` if the user closed the dialog without selecting anything,
          or on any error; or else:
        + an Object with the required data to create a VSM-term.
          It resembles the match-objects returned by vsm-autocomplete.
          It has properties:  
          + `str`
          + `style` (optional)
          + `id`  (note: not 'classID' but 'id', consistent with
            `VsmDictionary.getMatchesForString()`).
          + `dictID` (opt.) (only used for Ref/Inst/Class terms)
          + `descr` (opt.) (only used for Ref/Inst/Class terms)
          + `termType` (opt.) (see below)  (note: not 'type' but 'termType',
            to avoid confusion with the 'type' property of match-objects
            returned by `VsmDictionary,getEntriesForString()`).
          + `parentID` (opt.) (see below)
      + Notes 1:
        + If `allowClassNull` is `true`, it may return a match-object
          with `null` `id`.  
        + If `allowClassNull` is `false`, then returning a match with `null`
          `id` is wrong and would have the same effect as returning `false`.
      + Notes 2:
        + If a `match.termType` is given (`'R'`, `'I'`, `'C'`, or `'L'`),
          then it determines the created Term's type.
        + Else the created Term's type is inferred:
          + if `match.id==''` (which is also how VsmAutocomplete returns
            refTerms like 'it'), then it creates an R-Term (with all
            `...ID`s`==null`);
          + else, it creates an I- or C-Term, depending on whether the Edit-Term
            (from which advancedSearch was launched) is EI/ER/EL-type, or
            EC-type resp.
        + Note: if `match.termType=='R'`, and both `id` and `parentID` are
          not-null, then it creates an R-Term with `classID` and `parentID`
          not-null, i.e. a Term that refers to a Term in another VSM-sentence.
        + Like this, advancedSearch can generate any type of Term (R/I/C/L).
- `sizes`: {Object}: an object with some or all of the following properties  
  (any given one overrides a VsmBox default value for it):
  + `minWidth`: {Number}:  
    minimum width of the VsmBox. If the VsmBox is empty, this will be its
    initial width. (This width includes 'TheTerms'-subcomponent's padding).
  + `minEndTermWidth`: {Number}:  
    minimum width of the end-Term in non-focused state.
  + `minEndTermWideWidth`: {Number}:  
    minimum width of the end-Term in focused state.
  + `defaultEditWidth`: {Number}:  
    string-width for any Edit-type Term that has no own `editWidth` property;  
    (note: _'Term-width'_ = _'string-width'_ + padding & border).
  + `defaultMaxWidth`: {Number}:  
    string-width for any Term that has no own `maxWidth` property. To remove
    any limit, make this `0`.
  + `widthScale`: {Number|Boolean} (default `false`, which gets replaced by an
    automatically calculated Number, see earlier):  
    If an external stylesheet makes VsmBox use a larger font-size than default,
    then min/max/edit stringwidths can only contain less text than intended.
    Therefore, this custom multiplier will be applied to all stringwidths.
    (Applies to: min/max/editWidth, default...Width, minEndTerm...Width).
  + `theConnsMarginBottom`: {Number}:  
    Horizontal space at the bottom of TheConns, drawn not in TheConns-pane's
    main color, but in the same color as TheTerms' background. It reads this
    color from TheTerms' background-color CSS.  
    This makes it appear that TheTerms (which has no real top-padding) has
    padding on all sides, while a connector-leg's mousehover-highlighting
    can still be drawn right until against a Term's top border
    (by apparently intruding TheTerms' fake 'top padding').
  + `termDragThreshold`: {Number}:  
    The distance in pixels that a Term must be dragged before it starts moving.
  + `delayPopupShow`: {Number}: &nbsp; _(a 'size' in the time dimension)_  
    Delay before hovering or clicking a Term will show ThePopup for it.
  + `delayPopupSwitch`: {Number}:  
    Delay before showing ThePopup for a new Term, if ThePopup is already visible
    for another Term.
  + `delayPopupHide`: {Number}:  
    Delay before unhovering a Term (or ThePopup) will hide ThePopup.
- `custom-term`: {Function|false}:  
  can build custom content for non-Edit-type Terms' labels.  
  See below, under: "Custom content for Term labels".
- `custom-popup`: {Function|false}:  
  can build custom content for Terms' popup-box's info-panel.  
  See below, under: "Custom content for ThePopup".
- `term-copy (term)`: {Function|false}:  
  If given, this function will be called when the user selects the "Copy"
  menu-item in a Term's ThePopup. If not given or `false`, the Copy menu-item
  will not be accessible.  
  + Argument:
    + `term`: {Object}: follows the VSM-term data model (see earlier).
      + Except: it never has a
        `isFocal`/`minWidth`/`maxWidth`/`editWidth`/`queryOptions` property.
        This means that it copies only the core semantic data of a term,
        isolated from its role in a VSM-sentence or settings in a `vsm-box`.  
      + `dictID`/`descr` are included if they are available in the copied Term.
  + Notes:
    + When copying an Instance or Referring Instance, the copy's `instID`
      is made `null`. This is because a copy should be saved as a new Instance,
      with its own `instID`.
    + The "Copy Reference" menu-item calls this function as well.  
      In addition to the above, it also assigns the copied Term's `instID`
      to the copy's `parentID`. This makes that later when Pasting,
      the pasted Term will refer to the 'reference-copied' Term.  
      This menu-item is only available on Inst. and Ref. Inst. Terms that
      have a not-null 'instID`.
    + The main reason why the Copy (Ref) / Paste functionality exists,
      is to support the creation of references between sentences,
      i.e. between multiple `vsm-box`es.
      Therefore, the copy/paste handler (which should store the copied Term in
      some buffer) is designed to be external to the `vsm-box`.
- `term-paste`: {Function|false}:  
  If given, this function will be called when the user selects the "Paste"
  menu-item in a Term's ThePopup. If not given or `false`, the Paste menu-item
  will not be accessible.  
  During the application's run-time, this prop should be switched
  between `false` and a Function, based on the whether the external
  copy-handler has available term-data to paste. This can for example happen
  after `term-copy` receives a `term` for the first time.  
  If invalid data is given (e.g. an Instance Term with `classID==null` while
  the vsm-box's prop `allowClassNull==false`), then pasting will abort.
  + Returns a `term`: {Object}:  
    same form as `term-copy`'s argument.


<br>
<br>

## VsmBox's emitted events

<br>

- //To do


<br>
<br>

## User interaction

<br>

### User interaction on VSM-terms

- User-interaction on **Edit-type Terms** (including the endTerm):
  + [Initial note]: at creation time, a VsmBox puts an input field (either a
    VsmAutocomplete or a plain HTML &lt;input&gt;) in its first Edit-type Term.  
    If the VsmBox is empty or has only real (=non-endTerm) non-Edit-type Terms,
    it places this in the extra 'endTerm' (see earlier).  
    A VsmBox is implemented so that it holds only one input element at any time,
    and the user can move it from one Term to another.
  - Tab/Shift+Tab:  
    moves the input to the next/previous Edit-type, if any, respectively.  
    + Any content in the first, abandoned Term, remains visible.  
    + When moving to a Term that has previously abandoned content, it is used as
      the initial content of the input moved into that Term.
    + It switches between VsmAutocomplete and plain input as needed.
  - Click:  
    moves the input to the Edit-type Term, if it doesn't have it yet.  
    As for Tab, it preserves/uses existing content, and sets correct input-type.
  - Ctrl+Click:  
    cycles its type through the four Edit-types, in the order:  
    EI -> EC -> EL -> ER -> EI.  
    This also updates the input type (autocomplete/plain).  
    And this emits `change` + VsmBox's new (publicly visible) state.
  - Alt+Click: makes the term the focal term, or removes focal state if it was
    it already.
  - Esc, on an Autocomplete with closed selection-list (only), or on a plain
    input:  
    if the Edit-Term was (any) non-Edit-type Term before, then it restores the
    original Term. (Also restores the term-type if Ctrl+Click had changed it).
  - Backspace, on empty Term (only):  
    moves the input and focus on the Term before it, after converting it to
    an Edit-type Term if needed.  It has no effect in a first Term.
  - Ctrl+Delete:  
    removes the Term, and moves the input and focus to the term right after it
    (if it is an Edit-Term), or else to right before it (if Edit-Term),
    or else to the first Edit-Term that comes after it.  
    Does not remove the endTerm, but sets its type to 'EI' if it isn't that yet.
  - Ctrl+Enter:  
    + if the input contains certain string-codes: converts them to special
      characters, e.g. '\beta' to &beta;.
      (Currently only available in VsmAutocomplete inputs: type-EI/EC Terms).
    + else: inserts a new Edit-type Term ('#2') after the current Term ('#1').  
      It gives #2 the default type EI, leaves #1's current type
      (ER/EI/EC/EL) unchanged, and moves the focus to #2's position.  
  - Alt+ArrowUp / Alt+ArrowDown:  
    moves the Edit-Term one position to the left / right in the Terms-list.  
    Any attached VSM-connectors will stay attached and move along with it.  
    (Note: Alt+Left/Right would not be usable as they browser hotkeys).
  - Enter, on Autocomplete normal list-Item:  
    fills it, and switches the Term's type to its non-Edit counterpart (I or C).
  - Enter, on Autocomplete ItemLiteral:  
    - If the prop-function `advanced-search` is given (see extensive description
      above), then that function may provide a string, ID, etc. in another way.  
      This enables plugging in a custom dialog box for advanced term lookup.
    - Else: fills in a `classID: null` Term.  
    + Note: ItemLiteral is only shown to the user if the prop
      `allow-class-null==true`, or if an `advanced-search` function is available.
    + Note: ItemLiteral's content is configurable via prop `custom-item-literal`.
  - Enter, on plain input (of EL/ER-type Terms):  
    fills it, and switches the Term's type to L/R, resp.  
    + Note: when editing an existing R-term (e.g. by doubleclicking it,
      which changes it to an ER-Term, and then changing the text),  
      then pressing Enter _only_ changes the R-term's `str` string-label.  
      Any existing `classID`/`instID`/`parentID` is conserved (so, _not_ reset
      to `null`), and any `dictID`/`descr` is kept.  
      (In contrast, when entering an I/C-type Term (during EI/EC->I/C),
      the `instID` (if any), `classID`, etc. are reset).  
      (One can reset an R-term by selecting a refTerm like 'it' in autocomplete
      (after changing it into an EI/EC-Term), or via advanced-search).  
      In summary: when editing an R- or L-Term, one simply changes its label
      (and for an L-Term, that's all it has).
  - Shift+Enter on any Edit-type Term: immediately launches the
    `advanced-search` function, if is available.  
    This allows the user to bypass navigating to the ItemLiteral; and also to
    use advanced-search when no autocomplete-list is shown yet,
    e.g. for an empty input field.
  - Mousedown / drag:  
    - focuses the Edit-Term's input;
    - nothing special happens when mouse-dragging. Because for Edit-type Terms,
      mouse-dragging is used for selecting text in the input element.
  - Ctrl+Shift+Mousedown / drag:  
    Mousedown prepares for dragging, but does not start it yet.   
    After that, it listens to mousemove/mouseup/blur events on the whole page:  
    - Mousemove:
      - only when first moved past a distance set by prop
        `sizes.termDragThreshold`, it starts dragging;
      - if already dragging:
        - it updates the position of the Term, along with the mouse;
        - the movement of the Term is bound to 'stick' to the 'ribbon' of Terms,
          even when the mouse is moving further away;
        - it adds a placeholder-element that indicates the Term's target
          position between other terms, which moves along with the mouse too,
          in a stepwise way.
        + (Note: it listens to events on the whole page, because the mouse may
          leave the Term (when it moves so fast that it temporarily leaves the
          dragged Term, before the code can make the Term follow; or when the
          Term remains sticking to the ribbon), and then Term will not receive
          any events).
    - Mouseup: finalizes dragging: it puts the Term at the current location
      of its placeholder.
    - Blur (i.e. when browser loses focus): has the same effect as Mouseup.
  - Doubleclick on Edit-type Term: shows ThePopup for it.
  - Hover:
    - if ThePopup is already shown for another Term:
      now shows it for this Edit-Term instead, after a delay
      (see `sizes.delayPopup...`);  
    - if no ThePopup is shown yet: does not show it (in order to not interfere
      with Hover before Click to edit a Term).
  - Unhover: removes ThePopup after a delay, if shown.  
    Note that Esc and various other actions hide ThePopup too.

- User-interaction on **non-Edit-type** Terms:
  - Ctrl+Click on non-Edit-type Term:  
    cycles through the four types: I -> C -> L -> R -> I. &nbsp; Notes:  
    + Properties that are not relevant for a certain type (e.g. `instID`
      for Class-type) are still kept internally, so that the Term can be fully
      restored when cycling back to its original type (e.g. back to Instance).  
    + When `$emit()`ing a VsmBox's new value, later on, such internal,
      backed-up properties are not included in the emitted value.
    + When changing a Literal to Referring Term, it gets `null` for any of the
      `parentID` / `instID` / `classID` properties it did not yet have.
    + The result of  changing a Referring Term depends on the `allowClassNull`
      prop:  
      if `true`, it becomes an Instance Term;  
      if `false`, it can not be an Instance or Class Term, so it skips these
      and becomes a Literal Term.  
  - Alt+Click: makes the Term the focal Term, or removes focal state if it was
    focal already.
  - Doubleclick on non-Edit-type Term:  
    converts it into its corresponding Edit-type Term, and puts its current
    `str` in the input. (For EI/EC-type, also launches autocomplete lookup).
  - Mousedown or Ctrl+Shift+Mousedown + drag:  
    for dragging, see above.
  - Hover: shows ThePopup after a delay (see `sizes.delayPopup...`).
  - Unhover: removes ThePopup after a delay, if shown;  
    except if a new (Edit-/non-Edit-)Term is hovered before that delay expires.


<br>

### User interaction on the VSM-connector panel

- //To do


<br>
<br>

## Customized content

<br>

### Custom content for Term labels

The label (=stylized string) of non-Edit-type Terms (types R/I/C/L)
can be customized by giving a customizing function as the `custom-term` prop.  

`customTerm()` (if given) is called during the construction or update of each
non-Edit-type Term.  
It is called with one argument: an Object with useful properties:  
`customTerm(data)`:  
- `data`: {Object}:
  - `type`: the Term's internally used type: one of: R, I, C, L, ER, EI, EC, EL.
  - `index`: the Term's current index in the VSM-sentence.
  - `term`: the Term's VSM-term data, in the format defined earlier.
  - `vsmDictionary`: a reference to the VsmDictionary instance being used.  
    (It can not be used for queries, as `customTerm()` is synchronous. But
    it may be used for accessing e.g. `vsmDictionary.numberMatchConfig` details).
  - `strs`: {Object}:
    - `str`: the Term's label, which is the default content that would be used
      if `customTerm()` was not applied.  
      This text or HTML has the Term's custom CSS-styling `style` already
      applied.
    + Note: because a Term component (currently) has only one customizable part,
      `strs` has only one sub-property `str`.  
      This design makes `customTerm` uniform with the other customization
      functions, and also makes it future-proof (in case a Term would get
      additional parts).

`customTerm()` must return an Object like its argument `data.strs`.  
It may simply return the given `strs` object, after directly modifying its
`str` property.
+ E.g. `customTerm: o => { if (o.term.dictID == 'X') o.strs.str += '!'; return o.strs }`  
  would add a "!" to the end of a Term that has a `dictID` 'X'.  
  + Note: `dictID` will only be available if it was given in the `initial-value`
    prop (the VSM-sentence data object), or for a Term that was freshly entered.  
    (Note: even though extra info about a Term could be queried based on its
    `classID`, `customTerm()` is not designed to wait for such query results,
    and works with immediately available data only).  
    (Note though, that sometimes (e.g. with BioPortal dictionaries),
    the `dictID` may be derived from a Term's `classID`-URI).


<br>

### Custom content for ThePopup

**CSS**: all labels (a label is e.g. 'Key' in 'Key: 123') in ThePopup's
info-panel (top part) are defined in CSS, and can be overriden via
CSS-definitions as well.  

**Data**: all data (=non-label text/HTML) presented in ThePopup's info-panel can
be customized by giving a customizing function as the `custom-popup`
prop.

In addition, some extra panels can be added: above&below the settings-panel, and
above&below the menu-items.

`customPopup()` gets called during the construction or update of a ThePopup.
It is called with one argument: an Object with useful properties & subproperties:  
`customPopup(data)`:  
- `data`: {Object}:
  - `term`: the Term's VSM-term data, augmented with all internally added
    properties.
    (These extra properties should not be relied upon too much, but may be
    useful for some purposes, e.g. during software development).
  - `type`: the Term's internally used type: one of: R, I, C, L, ER, EI, EC, EL.
  - `dictInfo`: the info-object of the subdictionary from which this term came.  
    (This object is empty when no additional query results arrived yet; see note
    below).
  - `z`: the extra-info object `z`, associated with the Term's entry in the
    vsmDictionary.  
    (This object is empty when no additional query results arrived yet; see note
    below).
  - `vsmDictionary`: a reference to the VsmDictionary-instance being used.  
    (It can not be used for queries, as `customPopup()` is synchronous. But
    it may be used for accessing e.g. `vsmDictionary.numberMatchConfig` details).
  - `sizes`: the VsmBox's `sizes` prop, augmented with default values
    for sub-properties that were not explicitly given.
  - `strs`: the default content for the different parts of ThePopup.  
    It is an Object with properties (Strings) that represent the different parts.  
    These parts may contain HTML tags, but will most commonly be just text.  
    All properties are guaranteed to be of type {String},
    except for queryFilter/Sort/Idts, which are of type {Array(String)}.  
    - `str`: `term.str` as the title-line of ThePopup, with any `style` applied;
    - `descr`: the Term's description `descr`;
    - `dict`: its `dictID`; or if dictInfo-data is available then it is a
      combination of its `name` plus `abbrev` or `dictID`, depending on what
      fields are available;
    - `classID`:  its `classID` (=its vsmDictionary-entry's `id`), or `…`
      if unknown (i.e. `null`);
    - `instID`:   its `instID`, or `…` for null, or `''` if absent (for a C-type
      Term);
    - `parentID`: its `parentID` (=`instID` of its parent term), or `…` or `''`;
    - `queryFilter` (Array): a list of dictionary-info strings, for each of
      the Term's `queryOptions.filter.dictID[*]`s (if any);
    - `querySort` (Array): similar, for any `queryOptions.sort.dictID[*]`s;
    - `queryIdts` (Array): a list of string+ids, for each of
      the `queryOptions.idts[*]` fixedTerms (if any);  
      (the term-string part will be absent from this if no additional query
      results arrived yet; see note below);
    - `queryZ`: describes the z-object-property-filter in `queryOptions.z`,
      if given and not `true`, i.e. if there is an actual filter;
    - `minWidth`: the Term's `minWidth` (as a String);
    - `maxWidth`: the Term's `maxWidth`;
    - `editWidth`: the Term's `editWidth`, i.e. its width when its type is
      (or changes to) one of the Edit-types;
    - `widthScale`: the VsmBox's `sizes.widthScale` (or its auto-calculated
      value) (as a String), if it is different from its zero-effect value of 1;
    - `extra`: if not-empty, makes an extra subpanel appear, which shows
      the given text/HTML content; this subpanel appears after the term-info
      subpanel, and before the settings subpanel;
    - `extra2`: similar; this subpanel can appear under the settings subpanel,
      still inside the top scroll-pane.
    - `extra3`: similar; this subpanel can appear on top of the menu-items,
      outside of the scroll-pane.
    - `extra4`: similar; this subpanel can appear under the menu-items.

`customPopup()` must return an Object like its argument `data.strs`.  
It may simply return the given `strs` object, after directly modifying just
those properties it needs to.  
- E.g. `customPopup: data => { data.strs.str += '!'; return data.strs; }`  
  would add a "!" to the `str` title-line part of each ThePopup instance,
  and leave ThePopup's other parts unchanged. 
- If any part is an empty String, it will be left out of ThePopup.

`customPopup()` is asynchronous, but it may get called multiple times. 
+ It is called when ThePopup appears, or switches to a new Term.
+ It may then get called again after query results arrive, e.g. the `dictInfo`.
  So the panel may update its content shortly after it appears,
  while the user is already watching it.  
  (Note: this behavior is probably only acceptible/'nice' for a ThePopup, and
  does not occur with a Term's `custom-term`, which is called only once.
  When a whole page of VSM-sentences is loaded, they should not all
  flicker (or potentially change width) because of such updates;
  but for a single, manually summoned popup-box, this may be OK).


<br>

### Custom content in autocomplete's match list

Items in autocomplete's selection-panel can be customized
via the `custom-item` and `custom-item-literal` props.  
See [`vsm-autocomplete`](https://github.com/vsmjs/vsm-autocomplete)'s
description of its props with the same name.


<br>
<br>

## Other implementation details

<br>

### Management of widths and heights

The width and height of a VsmBox are determined by its subcomponents TheConns
and TheTerms:
- Height:
  - TheConns determines its own height: based on how much space is needed to
    fit all the Conns, plus space for adding a new Conn on top; and based on a
    certain minimum height.  
    TheConns' height can grow and shrink as Conns are added and deleted.  
    Layout settings (that would override default settings) can be given via
    the `sizes` prop (attribute to `<vsm-box>`).
  - TheTerms also determines its own height.
    + It first measures the height of a default Term, i.e. a HTML-element that
      has the `.term` CSS-class applied to it (it uses an invisible HTML-element
      to measure this). It then sets this height on all its Terms.  
    + Next, it measures top- and bottom-padding from `.terms`'s CSS-class. It
      adds this to Term's height, and sets the resulting height on itself.
  + TheTerms and TheConns are vertically stacked. They, together with any
    VsmBox border set via CSS, determine a VsmBox's height.
- Width:
  - TheConns will auto-adjust to have the same width as TheTerms. So a VsmBox's
    width is determined by TheTerms only.
  - TheTerms will take up the width of all Terms placed in a horizontal sequence,
    plus some extra space, plus space at the end for adding a new Term.  
    + It reads its own left+right padding from the `.terms` CSS-class.
    + It adds the width of all its contained Terms.
      + The width of a Term depends on the width of the String it holds, plus
        the `.term` CSS-class's current left+right padding & border sizes.
      + One can limit the width of the contained string to not exceed a maximum
        amount of pixels, which can be customized and given per Term.  
        Then if necessary, the string will be trimmed, with `'…'` appended.  
    + It adds some spacing between each Term: the sum of the `.term` CSS-class's
      left and right margin.
    + It adds some extra 'space' at the end.
      + This space is occupied by a special Edit-type Term, 'endTerm', which is
        excluded from the vsm-box data model.
      + This endTerm has a minimal width (given via the `sizes` prop). When it
        gets focused, it may become wider to give the user comfortable space
        for typing.
    + A TheTerms component will only grow in width; it does not shrink during
      editing. This gives more visual stability when editing a VsmBox.  
      It may shrink again e.g. after external code sets new `initial-value` data
      on the vsm-box component.

Notes:
+ A TheTerms component works with 'absolute positioning' of its Term
  subcomponents. So it takes full control over the positioning of its Terms,
  instead of relying on the browser's sometimes finnicky way of laying-out
  'floating' components.  
  Using absolutely positioned Terms enables more simple reactivity management:
  after determining the width of each Term, TheTerms does not have to re-query
  the DOM in order to know at what exact pixel each Term ended up, after some
  of their places or size changed by a Term add/edit/move-operation.  
  So to be clear: border- and padding-dimensions for TheTerms and Terms are
  defined via CSS-styles (`.terms` and `.term`). These are detected, and then
  implemented via absolute positioning instead.
+ It uses an invisible HTML-element with CSS-class `.ruler .term` to measure
  Term height and width, and to measure contained String widths in pixels.  
+ A comment in 'index-dev.html' demonstrates how to override the default CSS
  settings of various parts of a vsm-box.


<br>

### Combination of props `allow-class-null`, `advanced-search`, `custom-item-literal`

These three props determine:
- whether or not the item-literal is shown at the bottom of a vsm-autocomplete
  result list,
- what its content will look like, and
- what happens when the user selects this item-literal,
- what happens when the advanced-search dialog (if applicable) then returns a
  value.

This is how they combine:

|allow-class-null | advanced-search | custom-item-literal* | => itemLiteral's appearance | effect of Enter | effect of advancedSearch return value |
|-|-|-|-|-|-|
|  false |  false |  false |no itemLiteral  | | |
|  false |  false |**Func**|no itemLiteral  | | |
|  false |**Func**|  false |'search...'|shows dialog|creates term, if return!=false and `id`!=null|
|  false |**Func**|**Func**|{custom}   |shows dialog|creates term, if return!=false and `id`!=null|
|**true**|  false |  false |'create...'|creates term with `classID`=null| |
|**true**|  false |**Func**|{custom}   |creates term with `classID`=null| |
|**true**|**Func**|  false |'search...'|shows dialog|creates term, if return!=false|
|**true**|**Func**|**Func**|{custom}   |shows dialog|creates term, if return!=false|

*Note:  
&nbsp; &bull; 'search...' = something like: 'advanced search for {input-string}'.  
&nbsp; &bull; 'create...' = something like: 'create new term & id for
{input-string}'.  
&nbsp; &bull; {custom} = content determined by
`custom-item-literal ({input-string})`-function.

<br>

### Validity of emitted VSM-sentence data objects

`vsm-box` is designed to be an editor and presenter of VSM-sentence data.  
During every editing step, it emits the current state.  
The semantic validity of this state should be evaluated by **external**
functions.  

Because: when users construct a VSM-sentence step by step, they will
likely progress through states that are semantically invalid,
but that are necessary or nice-to-progress-through,
on their way building the final result.  
> For example: Users should not be blocked in their editing process
> by software that would refuse to add a new connector, before some incompatible
> connector is deleted.
> This is similar to how a text-editor does not block users while changing
> part of a natural-language sentence.

Such states may include:  
- Incomplete connector structure: where not all terms are connected yet.
- A new connector got added before an overlapping, erroneously added one gets
  deleted.  
- Connecting an Class Term to a parent, before later converting it to a
  Referring Instance.
- A Literal Term assigned as the sentence's focal Term, before the user
  replaces or changes it to another Term type.

`vsm-box` may handle simple semantic improvements though, before it emits
data. This may include [some are To Do, at time of writing]:
- Setting a Referring Term's classID to that of the parent it is
  connected to via a coreference connector.
- Removing `isFocal`, if it would be assigned to a Literal Term.
- When prop `allowClassNull == false`, it prevents that users would change
  an L/R-type Term to an I/C-type Term, when that L/R-type Term
  never had a classID associated with it.

<br>

### Data preloading

+ At creation time or when updating the `initialValue` prop, VsmBox evaluates
  all `initialValue.terms`, and:
  + It preloads any fixedTerms that terms may have in their `queryOptions.idts`.
    Preloading happens with `vsmDictionary.loadFixedTerms()`.  
    For efficiency, it groups together all found fixedTerms ('idts') into one
    preload-query (one per distinct `queryOptions.z`).  
    &rarr; Preloading fixedTerms is required for them to appear in autocomplete.
  + If `vsmDictionary` is wrapped in a 'vsm-dictionary-cacher' instance (which
    implies that it can also cache dictInfo-data, among others):  
    then it also queries for the dictInfo-data for all `dictID`s encountered in
    the `queryOptions` of Edit-type terms (only). Then this data will already be
    available in the cache before a VsmAutocomplete subcomponent may request it,
    which is likely in the case of a VSM-template and Edit-type Terms.  
    &rarr; Preloading dictInfos happens for efficiency only.


<br>

## FYI
This project's configuration (webpack + npm + Vue + testing + linting) will be as described in:  
&nbsp;&nbsp; [github.com/stcruy/building-a-reusable-vue-web-component](https://github.com/stcruy/building-a-reusable-vue-web-component),  
in order to build `vsm-box` as:  
&nbsp;&nbsp; 1) a standalone web-component, 2) a slim web-component, and 3) a Vue component.
