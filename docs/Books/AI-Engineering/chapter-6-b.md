---
hide:
  - toc
---
# :material-owl: **AI Engineering** by Chip Huyen

## **Chapter 6-B**

*Topic: Agents*

-----

Intelligent agents are considered by many to be the ultimate goal of AI. The extraordinary capabilities of foundational models have opened the doors for many agentic applications which were previously unimaginable (And the potential economic values of agents is also enormous).

&nbsp;

### :material-progress-star-four-points: **Agents Overview**

An agent is anything that can perceive it's environment and act upon that environment. This means that an agent is characterized by the *environment* it operates in and the *set of actions* it can perform.

- The *environment* an agent can operate in is defined by it's usecase.
- The *set of actions* an AI agent can perform is augmented by the tools it has access to.

Therefore there is a strong dependency on the environment and tools, as the environment decides what tools the agent can particularly use. This is also the case in vice-versa where the set of tools can also restrict what the agent can do within that environment (But I think it's better if there is a controlled environment).

Some examples of environments:

| Agent                           | Environment                     |
| ------------------------------- | ------------------------------- |
| Playing a game                  | Game                            |
| Scraping docs from the internet | Internet                        |
| Cooking robot                   | Kitchen                         |
| Self-driving car                | Road and it's surrounding areas |

Example of agent and tools:

| Agent   | Tools                                         |
| ------- | --------------------------------------------- |
| ChatGPT | Web search, Image generation, Code generation |

Examples of restrictions of tools and environment:

| Agent      | Tool             | Environment              |
| ---------- | ---------------- | ------------------------ |
| Chess game | Chess moves only |                          |
| Swimming   |                  | Restricted to water only |

Quite simply, an AI Agent is meant to finish the task that is provided to it by the user. So in an AI agent- AI is the brain which takes inputs as instructions or feedback. Processes it and generates a set of task lists i.e. the sequence of actions it needs to take and finally determines if a task has been completed.

&nbsp;

### :material-progress-star-four-points: **Tools**

A system doesn't necessarily need to have access to tools to be an agent. But without them there is a limitation due to a LLM's capabilities (we've heard this many times like- knowledge cut-off and only being able to generate texts).

A set of tools which an agent has access to is its *tool inventory*. More the number of tools, more capable the agent. But as mentioned before, having too many may also cause challenges while utilizing them.

There are generally 3 categories of tools which can be considered:

1. Knowledge augmentation (Context construction)
2. Capability Extension
3. Tools that let your agent act upon it's environment

##### 1. Knowledge augmentation

I think we've seen this multiple times already- How context to your model is absolutely essential and directly proportional to it's performance. Again this is due to the classic knowledge cutoff scenerio for LLMs.

This is where Web Search capabilities come in. Another thing that needs to be added here is that, the Internet API is very vast and it includes many APIs within it like Search API, News API, Social Media API etc. Therefore choose your Internet API with care.

##### 2. Capability Extension

Again, a repeated case. But there are different examples like giving a model:

- Tools for math calculation
- Date checker
- Currency conversion
- Translation

More complex capabilities can be: Code Interpreter where we can let it run, execute and the LLM can analyze the output (either the result or any errors).

Same use case comes in where ChatGPT can also generate images and execute codes along with it's text generation capability.

##### 3. Write actions

So far we have only discussed on how LLM tools only have read-only access. But what if they can perform write actions as well?

| Task                                       | Possible write action                    |
| ------------------------------------------ | ---------------------------------------- |
| SQL Query can retrieve data                | But it can also change/delete data       |
| Email API can read your inbox              | But it can also respond to emails        |
| Banking API can check your account balance | But it can also do a transaction for you |

By seeing the above examples we can tell how write actions will help to enable a complete autonomous agent. Like a Customer Outreach Workflow which includes tasks like: Researching -> Filtering contacts -> Drafting emails -> Sending emails -> Follow ups -> Responding -> Extracting orders -> Updating the database.

While this also comes with potential risks (like the case we saw with [replit where the agent just deleted their entire database](https://economictimes.indiatimes.com/news/new-updates/ai-goes-rogue-replit-coding-tool-deletes-entire-company-database-creates-fake-data-for-4000-users/articleshow/122830424.cms?from=mdr)), we will definitely reach a certain point where we will have enough security measures in place to have it up and running reliably.

<div class="x-twitter-embed" data-url="https://twitter.com/MoShahx07/status/1948230399802659195">
    <blockquote class="twitter-tweet">
        <a href="https://twitter.com/MoShahx07/status/1948230399802659195"></a>
    </blockquote>
</div>

&nbsp;