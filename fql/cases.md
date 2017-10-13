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

### Simple use of FQL

FQL was built to be used as a `Transform` stream. The constructor takes a set of matching rules that should describe the protein family of interest. For example, if the protein family of interest are the chemotaxis scaffold CheW, a possible rule would be `match all sequences that has only one CheW domain, as defined by Pfam 30 database`. In reality, the `FQLStream` can process multiple protein families definitions at once and therefore, the constructor takes an array of set of matching rules, each set for protein family. The output is the same information as the input plus a field `FQLMatches` with the indexes of the set of rules that this particular protein matches.

The readable stream pushing objects like these:

It reads objects and adds the field
```json
{
    "t": {
        "resource1": [
            ["feature",start, stop],
            ["feature2",start, stop],
        ],
        "resource2": [
            ["feature",start, stop],
        ],
    }
}
```

A real example of an input with domain architecture information about pfam28, smart and transmembrane predictions by das and TMHMM is:

```json
 {
    "t": {
        "das": [
            ["TM",14,31,21,4.055,0.0003693],
            ["TM",60,76,66,3.958,0.0005206]
        ],
        "pfam28": [
            ["MCPsignal",192,381,"..",26.8,4,207,".]",186,381,"..",195.8,3.5e-61,3.9e-58,0.96]
        ],
        "smart": [
            ["SM00283",135,382,1.3e-81]
        ],
        "tmhmm": [
            ["TM",16,38],["TM",60,82]
        ]
    }
 }
```
Notice that we name the feature `TM` in the transmembrane predictions, so we can use to make rules about this feature later. We will talk about how to setup these rules later.


Before we actually give an example of how to use `FQLStream`, we will give a quick example on how to use the `FQLService` which is the heart and soul of the FQL system.

#### Using FQLService (not recommended):

Suppose the input items are stored in an array named `sampleData`. The following code process each object and adds to them the information about matches to the rule and prints the final object in the screen. The rule in this case is any protein that starts with a CheW domain as defined by the pfam28 database

```javascript
'use strict'

let FQLService = require('./FQLService.js'),
	sampleData = require('./FQL-sample-input.json')

let setsOfRules = [
	[
		{
			pos: [
				{
					resource: 'fql',
					feature: '^'
				},
				{
					resource: 'pfam28',
					feature: 'CheW'
				}
			]
		}
	]
]

let fqlService = new FQLService(setsOfRules)

fqlService.initRules().then(function() {
	let promises = []
	sampleData.forEach(function(item) {
		promises.push(fqlService.findMatches(item))
	})
	Promise.all(promises).then(function(items) {
		items.forEach(function(item, i) {
			console.log(JSON.stringify(item))
		})
	}).catch((err) => {
		console.log(err)
	})
}).catch((err) => {
	console.log(err)
})
```

> Obviously, the path to the `FQLService.js` and the sample data must be adapted

#### Using FQLStream:





### Rules in FQL

In FQL, there are two types of rules: **non-positional** and **positional**. The first one allows you to select sequences by simple presence or abscence of features. The second one, more elaborated, allows you to be more specific and pass the order in which the domains should appear.

The rules are passed as a JSON object to FQL and it has two keys: `Npos` for non-positional rules and `pos` for positional rules. None of these keys are mandatory and FQL will return `true` match to every sequence if rules is an empty object. Other keys will be ignored.

The way rules are organized in FQL is the following:

* Query - Array containing alternative matching rules to define a protein family
    * Set of rules - Object containing rules that must all match. It is divided in positional and non-positional
        * rule - single instruction or set of instructions that must match.
            * instruction - single snipet of matching definition.

Example of a set of rules:

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resources: 'pfam28',
                feature: 'CheW'
            },
        ]
    }
]
```

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
                feature: "CheW"
            }
        ]
    }
]
```
If you want to define how many times the domain must appear, you can use the key `count`. For example:

If you want to select all sequences with only one matches to the CheW domain in Pfam28 database:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW",
                count: '{1}'
            }
        ]
    }
]
```

Notice that the *value* in `count` is between curly brackets and it is a `string`. This is because FQL borrows from the Regular Expression the notation for quantifiers which alows to not pass only numbers but also intervals. For example:

If you want to select all sequences with 1, 2 or 3 matches to the CheW domain in Pfam28 database:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW",
                count: '{1,3}'
            }
        ]
    }
]
```

If you want to select all sequences with 2 or more matches to the CheW domain in Pfam28 database:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW",
                count: '{2,}'
            }
        ]
    }
]
```

Note that as in regular experession, FQL also does not include support for *no more than*. Instead you can use `{1,4}` to indicate presence and no more than 4 matches.

The last important issue to know about **non-positional** rules in FQL is that you can add rules to the `Npos` array of objects and they all must match. It is a `AND` type of association. For example:

If you want to select all sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW",
                count: '{1,}'
            },
            {
                resource: "pfam28"
                feature: "HATPase_c",
                count: '{1}'
            }
        ]
    }
]
```

Finally, requirements for abscence of certain feature can be passed here as well by using `{0}`. For example:

If you want to select all sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28 AND NO matches to `Response_reg` in pfam28:

```javascript
[
    {
        "Npos": [
            {
                resource: "pfam28"
                feature: "CheW",
                count: '{1,}'
            },
            {
                resource: "pfam28"
                feature: "HATPase_c",
                count: '{1}'
            },
            {
                resource: "pfam28"
                feature: "Response_reg",
                count: '{0}'
            }
        ]
    }
]
```

You can also pass alternative rules. For that you need a new object in the *set of rules*. For example:

If you want to select all sequences with at least 1 match to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28:

```javascript
[
    {
        Npos: [
            {
                resource: 'pfam28',
                feature: 'CheW',
                count: '{2,}'
            }
        ]
    },
    {
        Npos: [
            {
                resource: 'pfam28',
                feature: 'HATPase_c',
                count: '{1}'
            }
        ]
    }
]
```

You can also use `count` to define a domain that should **NOT** be there. A negative. For that you just need to pass the value `{0}`. For example:

Filter proteins without TM region:

```javascript
[
    {
        Npos: [
            {
                resource: 'das',
                feature: 'TM',
                count: '{0}'
            }
        ]
    }
]
```

Finally, FQL allows the use of the wild card `.*`. **Don't mistake `.*` for `*`** in the `resource` field. For example:

Filter proteins with 1 domain from pfam28:

```javascript
[
    {
        Npos: [
            {
                resource: 'pfam28',
                feature: '.*',
                count: '{1}'
            }
        ]
    }
]
```

#### The **positional** rules

Positional rules are a bit more complicated and highly based on regular expression. It can also mimic the some behavior of non-positional rules as we will see it later.

For example, to accomplish the same result as for to select all sequences with only one matches to the CheW domain in Pfam28 database using positonal rules:

```javascript
[
    {
        pos: [
            {
                resource: 'pfam28',
                feature: 'CheW'
            }
        ]
    }
]
```

To allow for complex queries FQL, we borrow the *Regular Expression* lexicon `^` to determine the N-terminus of the sequence and `$` the C-terminus.

For example: to filter sequences with **only** **1** match to a CheW domain from Pfam28.

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'pfam28',
                feature: 'CheW'
            }
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

This is different from a non-positional rule because here no other element of the resources mentioned in the rule is allowed anywhere in the sequence. This will be more important when we discuss `scope of search` in FQL.

#### Count in positional rule

As in **non-positional** rules, FQL can also be used with the key `count`. Note that when using `count` with positional rules the value passed to `count` will be added to the query rule as regular expression quantifier. For example:

For example: to filter only sequences with CheW - CheW domain architecture and no other match to the pfam29 database will be selected.

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'pfam29',
                feature: 'CheW',
                count: '{2}'
            }
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

The key `count` can also be used to select a range of number of acceptable repeats of the domain.

For example: to Filter protein sequences with only 2 or 3 CheWs and nothing else:

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'pfam29',
                feature: 'CheW',
                count: '{2,3}'
            }
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```
Another example is to combine these elements to: filter proteins with 2 or 3 CheW protein domain at the end of the sequence, but allow anything else in the N-terminus:

```javascript
[
    {
        pos: [
            {
                resource: 'pfam29',
                feature: 'CheW',
                count: '{2,3}'
            }
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

Also it is worth notice that the `count` value is very limitant. for example:

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'pfam29',
                feature: 'CheW',
                count: '{2}'
            }
        ]
    }
]
```

will filter domain architecture such as CheW-CheW but not CheW-CheW-CheW. To pick the last one also, you must change the value `count` to `{2,3}`. If you omit `count`, then any sequence that have starts with CheW, independently of the next domain, will be filtered.

Wild card `.*` can also be used in positional rules for features:

For example if I want to search for any chemoreceptor (ending with MCPsignal) with any number more than 1 of any domains from pfam28 between two TM regions we use:

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: 'pfam28',
                feature: '*',
                count: '{1,}'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: 'pfam28',
                feature: '*',
                count: '{1,}'
            },
            {
                resource: 'pfam28',
                feature: 'MCPsignal',
                count: '{1}'
            },
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

To filter sequences that start with TM and end with MCPsignal.

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: 'pfam28',
                feature: '.*',
                count: '{1,}'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: 'pfam28',
                feature: '.*',
                count: '{1,}'
            },
            {
                resource: 'pfam28',
                feature: 'MCPsignal',
                count: '{1}'
            },
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

#### Negatives in positional rules and positional AND associations:

Before start to work with negatives we must talk about `AND` type of rules for a specific position.

> We did not code `OR` type of association of instructions for each position because it can be accomplished by the association of two entire set of rule, which is already implemented.

So far positional rules was composed by a list of objects each containing an instruction. Now, we will pass several instructions to the same position that MUST be matched in order to be selected.

To do that, each instruction can be passed as a list of instructions. This does not make much sense unless we use a negative.

To use negatives, you can use the same type of instruction with the `count` key with `{0}` value.  For example:

Filter proteins that starts with a TM region, and in between the two TM regions have any domain but Cache_1 form pfam28.

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            [
                {
                    resource: 'pfam28',
                    feature: 'Cache_1',
                    count: '{0}'
                },
                 {
                    resource: 'pfam28',
                    feature: '.*',
                    count: '{1}'
                }
            ],
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: 'pfam28',
                feature: '*',
                count: '{1,}'
            },
            {
                resource: 'pfam28',
                feature: 'MCPsignal',
                count: '{1}'
            },
            {
                resource: 'fql',
                feature: '$'
            }
        ]
    }
]
```

***
New tests:

* Start with a TM, any two domain but not XXX in either, another TM and end with MCPsignal


#### Combining positional and non-positional rules.

#### Scope of search.

```javascript
[
    {
        pos: [
            {
                resource: 'fql',
                feature: '^'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            },
            {
                resource: '.*',
                feature: '.*',
                count: '{2}'
            },
            {
                resource: 'das',
                feature: 'TM',
                count: '{1}'
            }
        ],
        Npos: [
            {
                resource: 'pfam28',
                feature: '.*',
                count: '{0,}'
            }
        ]
    }
]
```
Npos to ensure that pfam28 domains are counted

#### Overlapping features.

## Tests TODO

test that makes up for the next rule.



#### Expect error if

| Ok | Not ok|
| ---- | ---- |
| A{3} | A{2}, A |



----- END -------
below this is just ideas that must be looked at before finishing the project.




This brings us to discuss `scope of search` in FQL. For positional rules, any feature of all resources mentioned will be considered together. The consequences of this is complicated since several resources will map overlapping features. We will deal with overlaping features later.

For example: To pick


```javascript
[
    {
        Npos: [
            {
                resource: 'das',
                feature: 'TM',
                count: '{2}'
            }
        ],
        pos: [
            {
                resource: 'pfam28',
                feature: 'MCPsignal'
            },
            {
                resource: 'fql',
                feature: '$'
            }
        ]
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
        feature: 'CheW',
        count: '{2,3}'
    }
    {
        resource: null,
        feature: '$'
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