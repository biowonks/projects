# Case studies of the FQL

## Understanding the fundamentals of FQL

FQL is a flexible feature querying language for proteins that is based in a filtering mechanism. By feature we call anything that can be identified in a protein sequence: transmembrane regions, domain models, signal peptides, low complex regions and more. FQL is based in the `SeqDepot` database.


### What is domain architecture?

* Sequence definition of a protein domain
* Other features that are not domain but it is part of the domain architecture of a protein - TM, low complexity, signalP.
* Comprehensive domain architecture definition


### Searching the protein universe with Domain architecture

* domain definitions are getting better and in the future might be able to cover
* easy and simple way to query extensive databases - variable specificity
* multi-domain proteins
* pitfalls



### Rules in FQL

In FQL, there are two types of rules: **non-positional** and **positional**. The first one allows you to select sequences by simple presence or abscence of features. The second one, more elaborated, allows you to be more specific and pass the order in which the domains should appear.

The rules are passed as a JSON object to FQL and it has two keys: `Npos` for non-positional rules and `pos` for positional rules. None of these keys are mandatory and FQL will return `true` match to everysequence is rules is an empty object. Other keys will be ignored.

The way rules are organized in FQL is the following:

* Set of rules
    * rules
        * Individual rule.

The *set of rules*


Let's explore the types of rules:

#### The **non-positional** rules

Non-positional rules are easy. You just need to tell FQL the feature you want (or don't want) in your domain architecture. For example:

If you want to select all sequences with any number of matches to the CheW domain in Pfam28 database:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW
            }
        ]
    }
]
```





### Scope of search

### Single feature filter





Filter sequences with **any** number of matches to a CheW domain from Pfam29 **anywhere** in the sequence..

```javascript
[
    {
        resource: 'pfam29',
        id: 'CheW'
    }
]
```

In FQL, the filtering rule is passed as an Array of objects. Each object is called a feature. The mandatory keys are:
 * `resource` in which you must specify which `SeqDepot` resource you are using.
 * `id` which is the identifier or name of the feature to be present.

Other examples of simple rules like this will be:

Filter sequences with **any** number of matches to a CheW domain from SuperFamily **anywhere** in the sequence.

```javascript
[
    {
        resource: 'superfam',
        id: 'SSF50341'
    }
]
```

Filter sequences with **any** number of matches to a CheW domain from SMART **anywhere** in the sequence.

```javascript
[
    {
        resource: 'smart',
        id: 'SM00260'
    }
]
```

Filter sequences with **any** number of matches to a CheW domain from ProSite **anywhere** in the sequence.

```javascript
[
    {
        resource: 'proscan',
        id: 'PS50851'
    }
]
```

Since FQL is in essence a filter, sequences with other domains besides `CheW` will be selected.

To select only sequences with CheW domains, you must specify the boundaries in which you want to find the domain. For that we borrow the *Regular Expression* lexicon `^` to determine the N-terminus of the sequence and `$` the end. For example:

Filter sequences with **1** match to a CheW domains from Pfam29, and **only** CheW domains from Pfam29.

```javascript
[
    {
        resource: 'fql',
        id: '^'
    },
    {
        resource: 'pfam29',
        id: 'CheW'
    }
    {
        resource: 'fql',
        id: '$'
    }
]
```

Notice that the value of `resource` is `'fql'` since it is not to be searched in any database but it is part of the FQ language.

Another important aspect of FQL to filter queries based in single feature is the number or appearences you want to select.
For that FQL has the special key `count`. Note that when using `count` positional information is tricky and here starts some conventions that FQL must make. The argument passed to `count` in items between the items signaling the begin `^` and end `$` will be added to the query rule as regular expression quantifier and for that reason we will use the *curly brackets* notation `{}` as in regular expression. Note that quantifiers in regular expression is related to immediate repeat. For example:

```javascript
[
    {
        resource: null,
        id: '^'
    },
    {
        resource: 'pfam29',
        id: 'CheW',
        count: '{3}'
    }
    {
        resource: null,
        id: '$'
    }
]
```

In this case, only sequences with CheW - CheW - CheW domain architecture and no other match to the pfam29 database will be selected. If you want to pick sequences with only 2 or 3 CheWs and nothing else:

```javascript
[
    {
        resource: null,
        id: '^'
    },
    {
        resource: 'pfam29',
        id: 'CheW',
        count: '{2,3}'
    }
    {
        resource: null,
        id: '$'
    }
]
```

But this won't match something like this:
![img](http://seqdepot.net/api/v1/aseqs/7hMuWLhwA4TkUJ5akVyt8Q.png)

For that you need to eliminate the `^` part of the rule:

```javascript
[
    {
        resource: 'pfam29',
        id: 'CheW',
        count: '{2,3}'
    }
    {
        resource: null,
        id: '$'
    }
]
```



### Multi-feature filtering

A large number of protein families of interest needs more than 1 feature to be uniquely identified. FQL was designed to deal with these cases. For example:

Select any sequence with a region matching CheW domain followed by a region matching a Response Regulator, both from pfam29 and nothing else (from pfam29).


```javascript
{
    name: 'CheV'
    rule: ['CheW|pfam29', 'RR|pfam29']
}
```

A protein that has a CheW domain fused to a RR domain is defined as CheV. In this case, only proteins matching strictly CheW-RR domain architecture will be selected. The order of the instruction in the rule list is preserved in the search.

Another important case, is to select sequences from protein families that underwent through extensive domain swaps. Thus, there will be only one domain common to all members of the protein family but each sequence will have one or more other regions with matches to features in the same resource. For example Methyl-accepting chemotaxis proteins (MCP), is defined by the presence of the MCP_signal domain (pfam). Let's select all MCPs from the database:

Select any sequence that match MCP_signal domain from the pfam29 database and nothing else.

```javascript
{
    name: 'MCP'
    rule: ['MCP_signal|pfam29']
}
```
The *'nothing else'* clearly will not let this query to select all the chemoreceptors in the database. Most of the domain diversity in MCPs happen in the N-terminus direction from the MCP_signal domain. To accommodate this variability we introduce the positional wild-card character `*`.

Select any sequence that match MCP_signal domain from the pfam29 database and nothing else towards the C-terminus.

```javascript
{
    name: 'MCP'
    rule: ['*MCP_signal|pfam29']
}
```

This rule will select sequences that has MCP_signal as the domain closest to the C-terminus and any other combination of number or type of matches to other pfam29 models towards the N-terminus.

**Most** but not all chemoreceptors have the MCP_signal domain as the closest domain to the C-terminus. To find all chemoreceptors we need:

Select any sequence that match MCP_signal domain from the pfam29 database anywhere in the sequence.

```javascript
{
    name: 'MCP'
    rule: ['*MCP_signal|pfam29*']
}
```
Including the `*` operator in the left side of the instruction guarantees that MCP_signal matches can be found anywhere relative to other regions hitting pfam29 models.

The positional wild-card is only referent the next determined boundary. In FQL, the `[` marks the N-terminus of the protein and the `]` marks the C-terminus as mandatory boundaries. Thus the rule `['*MCP_signal|pfam29*']` searches for MCP_signal anywhere between the N-terminus and the C-terminus (the whole protein sequence).

Adding another instruction will limit the possibilities of localization selected by the wild-card. For example, some chemoreceptor will have a TM region in the N-terminus. Let's select those:

Select any sequence that starts with TM region as defined by DAS and match MCP_signal domain from the pfam29 database anywhere else in the sequence.


```javascript
{
    name: 'MCP starting with 1 TM'
    rule: ['|das', '*MCP_signal|pfam29*']
}
```

In this rule, proteins with MCP_signal as the closest feature to the N-terminus of the sequence will not be selected. Notice that only one of the instructions carries the `*` operator. This is **BAD**. Without the `*` operator in the `|das` instruction, this rule will select only sequences with EXACT 1 TM region and that it is the closest feature (from DAS or pfam29) from the N-terminus. This means that this rule is searching for sequences that puts the MCP_signal domain in the periplasm, which is unheard of. To fix this we need to add the `*` operator:


```javascript
{
    name: 'MCP starting with 1 TM'
    rule: ['|das*', '*MCP_signal|pfam29*']
}
```
Now this query is selecting sequences with at least 1 TM region as the closest feature to the N-terminus and any number of matches (different than zero) to MCP_signal in the rest of the sequence.

Several chemoreceptors will have two TM regions and both of them are towards the N-terminus from the MCP_signal. If we just add another instruction `|das*` we get:


```javascript
{
    name: 'MCP'
    rule: ['|das*', '|das*', '*MCP_signal|pfam29*']
}
```

This query, as is, will select sequences with N-terminus TM region, followed by any (including none) feature from pfam, but not from das (notice the lack of the `*` operator in the second instruction) and with at least 1 MCP_signal to the C-terminus of the second TM region.

Sequences with these features and any number of extra TM regions more than these two explicitly determined will not be selected. To allow for the possibilities to include other TM, the `*` operator must be included in the right side of the second instruction.

Select any sequence that has at least two TM regions to the left of the MCP_signal and one of them being the closest feature to the N-terminus and at least one region matching MCP_signal domain from the pfam29 database anywhere else in the sequence


```javascript
{
    name: 'MCP'
    rule: ['|das*', '*|das*', '*MCP_signal|pfam29*']
}
```

However, there might be proteins with two TM regions but with more than one region matching MCP_signal. Let's suppose that we do not want to include those. There are several ways to do that with the operators already described. However, FQL has the operator `counts`, represented by the character `_` followed by a number. So to not select sequences with more than 1 MCP_signal we need to modify the rule:


```javascript
{
    name: 'MCP'
    rule: ['|das*', '*|das*', '*MCP_signal|pfam29_1*']
}
```

This allows for some simplification in other cases, for example: a trailed double TM regions:


```javascript
['|das', '|das*'] == ['|das_2*'] != ['|das*', '*|das*']
```

As of right now, the MCP query will collect all MCPs with 2 TM regions, one of them in the N-terminus and 1 MCP_signal domain to the right of the second TM region. Great! This query allows for chemoreceptors that contains any, or even none, sensory domain in the periplasmic region (between the two TM region.)

However, let's say we only want chemoreceptors with either one of the two sensory domain models: 4HB_MCP or TarH.


```javascript
{
    name: 'MCP'
    rule: ['|das', 'das*', '4HB_MCP.TarH|pfam29', '*|das*', '*MCP_signal|pfam29_1*']
}
```

Notice that the lack of `*` operator will make this rule to select sequences with only 1 region matching either 4HB_MCP or TarH domains in pfam29 between at least 2 TM regions. To select the same but with exact 2 TM regions:


```javascript
{
    name: 'MCP'
    rule: ['|das', '^',  ['4HB_MCP|pfam29', 'TarH|pfam29'], '|das', '*MCP_signal|pfam29_1*']
}
```



### Getting to details

We already talked about and extensive amount of details for you to build your query rule in a intuitive and specific way. But sometimes, details matter and FQL provides another



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
| `_` | feature counter | `['|das_2*']` |

Now, let's suppose you want a more complex


Any sequence with only 1 region matching a CheW domain from pfam29 and nothing else.

```javascript
{
    rule: ['CheW|pfam29']
}
```



Any sequence with at least 1 CheW domain from pfam29

```javascript
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


```javascript
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

---

Select the sequences with only 1 transmembrane region defined by DAS, TMHMM or both


```javascript
{
    name: 'proteins with 1 TM region'
    rule: ['|das.tmhmm']
}
```

There are two new concepts here. First, notice that no feature was passed (left side of `|`) in this instruction. This is because we are searching for 'any' feature in das or tmhmm.

The second concept is very important. In FQL, the character `.` means **OR** as in logic disjunction. In this example, we are searching for a TM region defined by DAS or TMHMM or both.

You can also try to select proteins that contain 1 TM region predicted by both DAS and TMHMM. To do that in FQL you will use the character `,` that means **AND** as in logic junction. For example:

Select the sequences with only 1 transmembrane region defined by DAS **AND** TMHMM.


```javascript
{
    name: 'proteins with 1 TM region'
    rule: ['|das,tmhmm']
}
```

**However, in this scenario, FQL will select proteins with 1 TM predicted by both TMHMM and DAS, but not necessarily in the same place. There could be sequences with non-overlappping TM prediction by DAS in the N-terminus and by TMHMM in the C-terminus and it would be selected by this rule. We will see later how to guarantee that the same region of the sequence is predicted by both tools as TM.**

Now, for some reason still obscure to us, some one wants to select proteins with 1 TM region predicted by DAS but not by TMHMM. To do that we need to introduce the operator *NOT* as the character `!` and its use is simple:

Select the sequences with only 1 transmembrane region defined by DAS but **NOT** by TMHMM.


```javascript
{
    name: 'proteins with 1 TM region'
    rule: ['|das,!tmhmm']
}
```

These operator may be used in the `feature` part of the instruction, for example:

Select any sequence with only 1 region matching a CheW domain **OR** a Response Regulator domain from Pfam29 and nothing else.


```javascript
{
    name: 'CheW and CheYs'
    rule: ['CheW.RR|pfam29']
}
```

> Obviously, the **AND** operator makes less sense in the feature part of the instruction than in the resource part. This is because we defined the domain hit as the most significant match and there can only be 1. **Overlapping cases will be handled in the future.**
---