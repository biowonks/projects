# Case studies of the FQL

## Understanding the fundamentals of FQL

### Single feature search

Any sequence with only 1 region matching a CheW domain from Pfam29 and nothing else.
```json
{
    name: 'CheW'
    rule: ['CheW|pfam29']
}
```

In FQL, the value in front of the key `name` will serve as an identifier and we will understand why they should be unique for each definition later.

The actual query of features will come in front of the key `rule` and each element of the list is called `instruction`. In this example `CheW|pfam29` is the only `instruction` in this `rule`. Imagine the list of `instructions` passed to `rule` as the domain architecture you are looking for with c-terminus to the left of the list and n-terminus to the right of the list.

In FQL you can search for features in any resource from SeqDepot. It is mandatory to specify from which resource the feature should belong. FQL uses the character `|` as delimiter between the feature and the resource. Generically, an instruction is made of `feature|resource`. Other examples of simple searches like this will be:

Any sequence with only 1 region matching a CheW domain from SuperFamily and nothing else.
```json
{
    name: 'CheW'
    rule: ['SSF50341|superfam']
}
```

Any sequence with only 1 region matching a CheW domain from SMART and nothing else.
```json
{
    name: 'CheW'
    rule: ['SM00260|smart']
}
```
Any sequence with only 1 region matching a CheW domain from ProSite profile scan and nothing else.
```json
{
    name: 'CheW'
    rule: ['PS50851|proscan']
}
```

The *'nothing else'* part of the query is a bit tricky to understand and it is ambiguous: *'nothing else'* refers to no other match to any other feature of any other resource or just from the resource defined in the rule?

The second option is correct. FQL will work within the universe of resources that appears in your query. However, you can search for a feature in more than one resource in the same instruction, for example:

Select the sequences with only 1 transmembrane region defined by DAS, TMHMM or both

```json
{
    name: 'proteins with 1 TM region'
    rule: ['|das.tmhmm']
}
```

There are two new concepts here. First, notice that no feature was passed (left side of `|`) in this instruction. This is because we are searching for 'any' feature in das or tmhmm.

The second concept is very important. In FQL, the character `.` means **OR** as in logic disjunction. In this example, we are searching for a TM region defined by DAS or TMHMM or both.

You can also try to select proteins that contain 1 TM region predicted by both DAS and TMHMM. To do that in FQL you will use the character `,` that means **AND** as in logic junction. For example:

Select the sequences with only 1 transmembrane region defined by DAS **AND** TMHMM.

```json
{
    name: 'proteins with 1 TM region'
    rule: ['|das,tmhmm']
}
```

**However, in this scenario, FQL will select proteins with 1 TM predicted by both TMHMM and DAS, but not necessarily in the same place. There could be sequences with non-overlappping TM prediction by DAS in the N-terminus and by TMHMM in the C-terminus and it would be selected by this rule. We will see later how to guarantee that the same region of the sequence is predicted by both tools as TM.**

Now, for some reason still obscure to us, some one wants to select proteins with 1 TM region predicted by DAS but not by TMHMM. To do that we need to introduce the operator *NOT* as the character `!` and its use is simple:

Select the sequences with only 1 transmembrane region defined by DAS but **NOT** by TMHMM.

```json
{
    name: 'proteins with 1 TM region'
    rule: ['|das,!tmhmm']
}
```

These operator may be used in the `feature` part of the instruction, for example:

Select any sequence with only 1 region matching a CheW domain **OR** a Response Regulator domain from Pfam29 and nothing else.

```json
{
    name: 'CheW and CheYs'
    rule: ['CheW.RR|pfam29']
}
```

> Obviously, the **AND** operator makes less sense in the feature part of the instruction than in the resource part. This is because we defined the domain hit as the most significant match and there can only be 1. **Overlapping cases will be handled in the future.**

### Multi-feature searches

A large number of protein families of interest needs more than 1 feature to be uniquely identified. FQL was designed to deal with these cases. For example:

Select any sequence with a region matching CheW domain followed by a region matching a Response Regulator, both from pfam29 and nothing else (from pfam29).

```json
{
    name: 'CheV'
    rule: ['CheW|pfam29', 'RR|pfam29']
}
```

A protein that has a CheW domain fused to a RR domain is defined as CheV. In this case, only proteins matching strictly CheW-RR domain architecture will be selected. The order of the instruction in the rule list is preserved in the search.

Another important case, is to select sequences from protein families that underwent through extensive domain swaps. Thus, there will be only one domain common to all members of the protein family but each sequence will have one or more other regions with matches to features in the same resource. For example Methyl-accepting chemotaxis proteins (MCP), is defined by the presence of the MCP_signal domain (pfam). Let's select all MCPs from the database:

Select any sequence that match MCP_signal domain from the pfam29 database and nothing else.
```json
{
    name: 'MCP'
    rule: ['MCP_signal|pfam29']
}
```
The *'nothing else'* clearly will not let this query to select all the chemoreceptors in the database. Most of the domain diversity in MCPs happen in the N-terminus direction from the MCP_signal domain. To accommodate this variability we introduce the positional wild-card character `*`.

Select any sequence that match MCP_signal domain from the pfam29 database and nothing else towards the C-terminus.
```json
{
    name: 'MCP'
    rule: ['*MCP_signal|pfam29']
}
```

This rule will select sequences that has MCP_signal as the domain closest to the C-terminus and any other combination of number or type of matches to other pfam29 models towards the N-terminus.

**Most** but not all chemoreceptors have the MCP_signal domain as the closest domain to the C-terminus. To find all chemoreceptors we need:

Select any sequence that match MCP_signal domain from the pfam29 database anywhere in the sequence.
```json
{
    name: 'MCP'
    rule: ['*MCP_signal|pfam29*']
}
```
Including the `*` operator in the left side of the instruction guarantees that MCP_signal matches can be found anywhere relative to other regions hitting pfam29 models.

The positional wild-card is only referent the next determined boundary. In FQL, the `[` marks the N-terminus of the protein and the `]` marks the C-terminus as mandatory boundaries. Thus the rule `['*MCP_signal|pfam29*']` searches for MCP_signal anywhere between the N-terminus and the C-terminus (the whole protein sequence).

Adding another instruction will limit the possibilities of localization selected by the wild-card. For example, some chemoreceptor will have a TM region in the N-terminus. Let's select those:

Select any sequence that starts with TM region as defined by DAS and match MCP_signal domain from the pfam29 database anywhere else in the sequence.

```json
{
    name: 'MCP starting with 1 TM'
    rule: ['|das', '*MCP_signal|pfam29*']
}
```

In this rule, proteins with MCP_signal as the closest feature to the N-terminus of the sequence will not be selected. Notice that only one of the instructions carries the `*` operator. This is **BAD**. Without the `*` operator in the `|das` instruction, this rule will select only sequences with EXACT 1 TM region and that it is the closest feature (from DAS or pfam29) from the N-terminus. This means that this rule is searching for sequences that puts the MCP_signal domain in the periplasm, which is unheard of. To fix this we need to add the `*` operator:

```json
{
    name: 'MCP starting with 1 TM'
    rule: ['|das*', '*MCP_signal|pfam29*']
}
```
Now this query is selecting sequences with at least 1 TM region as the closest feature to the N-terminus and any number of matches (different than zero) to MCP_signal in the rest of the sequence.

Several chemoreceptors will have two TM regions and both of them are towards the N-terminus from the MCP_signal. If we just add another instruction `|das*` we get:

```json
{
    name: 'MCP'
    rule: ['|das*', '|das*', '*MCP_signal|pfam29*']
}
```

This query, as is, will select sequences with N-terminus TM region, followed by any (including none) feature from pfam, but not from das (notice the lack of the `*` operator in the second instruction) and with at least 1 MCP_signal to the C-terminus of the second TM region.

Sequences with these features and any number of extra TM regions more than these two explicitly determined will not be selected. To allow for the possibilities to include other TM, the `*` operator must be included in the right side of the second instruction.

Select any sequence that has at least two TM regions to the left of the MCP_signal and one of them being the closest feature to the N-terminus and at least one region matching MCP_signal domain from the pfam29 database anywhere else in the sequence

```json
{
    name: 'MCP'
    rule: ['|das*', '*|das*', '*MCP_signal|pfam29*']
}
```

However, there might be proteins with two TM regions but with more than one region matching MCP_signal. Let's suppose that we do not want to include those. There are several ways to do that with the operators already described. However, FQL has the operator `counts`, represented by the character `_` followed by a number. So to not select sequences with more than 1 MCP_signal we need to modify the rule:

```json
{
    name: 'MCP'
    rule: ['|das*', '*|das*', '*MCP_signal|pfam29_1*']
}
```

This allows for some simplification in other cases, for example: a trailed double TM regions:

```json
['|das', '|das*'] == ['|das_2*'] != ['|das*', '*|das*']
```

To cover:
* wild-card domains (separate keys)
* OR via brackets
* wild_card scope delimiters ( `*|pfam29*` and `*|pfam29_2*` )
* OR at the Rule level (via name)

## Table of operators

| Operator | Function | Example |
|---|---|---|
| `|` | separates `feature` and `resource` | `'CheW|pfam29'`|
| `.` | logical disjunction - **OR** | `'|das.tmhmm'`|
| `,` | logical conjunction - **AND** | `'|das,tmhmm'`|
| `!` | logical negation - **NOT** | `'|das,!tmhmm'`|
| `*` | positional wild card | `'*MCP_signal|pfam29*'` |
| `_` | feature counter | ['|das_2*'] |

Now, let's suppose you want a more complex


Any sequence with only 1 region matching a CheW domain from pfam29 and nothing else.
```json
{
    rule: ['CheW|pfam29']
}
```



Any sequence with at least 1 CheW domain from pfam29
```json
{
    rule: ['*CheW|pfam29*']
}
```



## Edges

Anything that starts with 1 TM from das
>`['|das*']`

Anything that ends with 1 TM from das

>`['*|das']`

Anything that has at least 1 TM from das

>`['*|das*']`

Anything that has at least 2 TM from das anywhere in the sequence

```json
['*|das*', '*|das*']
['*|das', '*|das*']
['*|das*', '|das*']
```

Anything that has at least 2 neighboring TM from das anywhere in the sequence

>`['*|das', '|das*']`

## Complicated rules:

1. CheW followed exact by RR or at least another CheW and it does not exclude the existence of other domains to the right of the first CheW
>`['CheW|pfam29', ['or', '*CheW|pfam29', 'RR|pfam29']]`

1. CheW followed exact by RR or by a CheW and any number of other domains and having the last domain as CheW
>`['CheW|pfam29', ['*CheW|pfam29', 'RR|pfam29'], 'CheW|pfam29',]`

1. CheW followed exact by RR or by a CheW and 3 other domains in any order and finishing with another CheW domain.
>`['CheW|pfam29', [['*CheW|pfam29', '*|pfam29', '*|pfam29', '*|pfam29'], 'RR|pfam29'], 'CheW|pfam29',]`

1. 1 TM + TarH + 1TM + any (not zero) number of features from pfam29 + MCP_signal
>`['|das', 'TarH|pfam29', '|das', '*|pfam29', 'MCP_signal|pfam29' ]`

1. 1 TM + TarH + 1TM + any (not zero) number of feature from any source but das + MCP_signal
>`['|das', 'TarH|pfam29', '|das', '*|*,!das', 'MCP_signal|pfam29' ]`






1 anywhere from pfam29: ['*CheW|pfam29']
* 2 anywhere from pfam29: ['*CheW|pfam29', '*CheW|pfam29']
* 1 exact from pfam29: ['CheW|pfam29']
* 2 exact from pfam29: ['CheW|pfam29', 'CheW|pfam29']
* 1 exact followed by option of two from pfam29: ['CheW|pfam29', ['or', 'CheW|pfam29', 'RR|pfam29']]

what does this mean?



