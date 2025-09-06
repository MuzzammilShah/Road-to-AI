## Basic Understanding

**Definition:** MCP is an open protocol that standardizes how your **LLM applications** connect to and work with your **tools & data sources.**

> So the idea here is not to reinvent the wheel like how we use tools etc, but to standardize the way our AI Applications connect with data sources.

**Other previously existing concepts:**
- **REST APIs:** Standardizes how **web applications** interact with the **backend**.
- **LSP(Language Server protocol):** Standardizes how **IDEs** interact with language specific tools.

- **MCP:** Standardizes how **AI applications** interact with **external systems**.

> Interestingly, **anything that can be done using MCP can also be done without MCP**. The only aim of this to have a common umbrella (we use the word 'standarize') for our AI Applications to interact with external sources.

> So intead of creating different connections each time to different sources from our application (like how we did with APIs), we build this i.e. MCP once and connect anywhere.

**How is using an MCP Server different from just calling a service's API directly?**

MCP Servers do seem every similar to working with APIs (and that's not totally wrong if you think about it). We can instead see it as a gateway/wrapper that is built on top of an API. So if you don't want to bother calling the API directly, you can just ask in natural language and the MCP server will handle that for you.

**Sounds like MCP Servers and tool use are the same thing?**

MCP Servers provide tool schemas + functions already defined for you.

&nbsp;

## MCP Architecture

MCP is essentially a Client-Server Architecture. The following two slides from DeepLearning.AI course show this well.

<div align="center">
<img src="../static/mcp-arch-1.png" alt="Client-Server Architecture" width="90%">
</div>

<div align="center">
<img src="../static/mcp-arch-2.png" alt="Working of Client-Server Architecture" width="90%">
</div>

