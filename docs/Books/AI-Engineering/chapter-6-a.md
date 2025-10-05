---
hide:
  - toc
---
# :material-owl: **AI Engineering** by Chip Huyen

## **Chapter 6-A**

*Topic: Retrieval Augmented Generation*

-----

### :material-progress-star-four-points: **Retrieval Augmented Generation (RAG)**

A RAG system has two components:

- A *retriever* that retrieves information from an external memory storage.
- A *generator* that generates a response based on the retrieved info.

Rather than using off the shelf retrievers and models, fine tuning the entire RAG system end-to-end can improve it's performance significantly.

**Important:** Success of RAG depends on the quality of its retriever.

**A retriever has two main functions: Indexing and Querying**

- Indexing: involves processing the data so that it can be retrieved quickly later.
- Querying: sending query to retrieve data that is relevant to it. 

**Important:** How we index the data depends on how quickly we want to retrieve the data later on.

**Retrieval VS Search?**
Retrieval involves one DB or system, Search involves retrieval across various systems.

**Simple RAG Workflow breakdown:**

- An external source containing all the relevant information, are split and later retrieved as chunks.
- The goal is to retrieve chunks that are relevant to us.
- A minor post processing is needed in order to join the retrieved chunks with the user prompt to form the final prompt.
- This final prompt is then fed into the model.

&nbsp;

### :material-progress-star-four-points: **Retrieval Algorithms:**

At the core, retrieval works on ranking of docs based on their relevance to a given query. Retrieval algo differ based on how they calculate their relevance score.

Common retrieval based mechanisms are **Text based** and **Embedding based**.

&nbsp;

#### **Term based retrieval:**

Now, the most straight forward way of finding relevant documents to a query is by matching its keywords.

Here are two metrics to measure this:

i. TF (Term frequency)- where document is to be included if there are more number of keywords.
ii. IDF (Inverse Document Frequency)- the term's importance is inversely proportional to the number of times of its occurrence.

We also have an algorithm which is a combination of both of those metrics called **TF-IDF** (wasn't too hard to name that lol).

But, the most common term-based retrieval solutions are: **Elastic search** and **BM25**.

##### **Elastic Search:**

- Uses a data structure called *Inverted Index*.
- A dictionary that maps the terms to the documents that contain them, therefore allows for fast retrieval of documents given a term.
- They also store additional information such as TF and 'Document count' i.e. how many documents contain this term, which are useful for computing TF-IDF scores (We saw this above).

##### **BM25:**

- *Side note: Now that I think of it, this is the same algorithm/method which Aravind Srinivas mentioned in this podcast with Lex Fridman (the author of this book also mentioned that he had tweeted on this as well, how it is hard to make genuine improvement from this - that's how good this is).*
- BM stands for Best Match.
- Compared to the naive TF-IDF (ouch), BM25 normalizes frequency score by documents length.
- Longer document are more likely to contain a term and have higher term frequency values.
- **BM25 is still widely used in the industry and form formidable base lines against industry standard algos like Embedded-based retrievals**.

Packages/Libraries that follow term-based retrievals? NLTK (Natural Language ToolKit), spaCy and Stanford's CoreNLP - they also offer tokenization functionalities.

&nbsp;

#### Embedding-based retrieval:

The problem with term-based retrieval is that, just because the term has appeared in a document, it can't necessarily be relevant to what we are looking for.
For example: If we search for the term "transformer architecture", it can either retrieve info on the famous paper or on the movie.

That's why embedding-based retrievers aim to rank documents based on how closely their *meaning* align with the query. This approach is called **Semantic retrieval**.

Note: In a RAG workflow, we can also have an additional component called Re-ranker where we can rerank all retrieved candidates and caches to reduce latency.

As mentioned before, **an embedding is a vector that aims to preserve the important properties of the original data.** In Embedding-based retrieval, we perform **vector search**.

&nbsp;

The algorithms used in vector search can vary based on the size of the database.

**For Small datasets:** the most basic/naive method is `k-nearest neighbour`, the iconic one lol. Although the results of this are precise, it is computationally heavy and slow.
How it works internally:

1. Compute similarity scores between query embedding and all vectors in DB using metrics such as cosine similarity (*I would personally like to learn more about this as well, as to why we use this and do we have any different options. What I do know that this works best for almost every standard data).*
2. Rank all vectors by Similarity Score.
3. Return *k* vectors with highest similarity score.

**For Larger datasets:** we can use `ANN (Approximate Nearest Neighbor` algorithm. There are different libraries which implement this: FAISS (Facebook AI Similarity Search - my first ever vector search xD), Google's ScaNN, Spotify's Annoy and HNSW (Hierarchical Navigable Small World - I've used this as well as an upgrade to FAISS).

As developers, we normally wouldn't implement vector search ourselves, here are a list of different approaches which can be used. 

Before that, it is important to know that vector database store vectors in the form of buckets, graphs or trees. It's the search algorithms that differ in how they increase the likelihood that similar vectors are close to each other. Also, vectors can be quantized (reduced precision) or sparse, as they become computationally less expensive to work with that way.

Now, here are some significant vector search algorithms:

1. LSH (Locality-sensitive hashing):
	- This involves hashing similar vectors into the same buckets to speed up similarity search, trading some accuracy for efficiency.
	- Implemented in FAISS and Annoy.
2. HNSW (Hierarchical Navigable Small World):
	- Constructs multi-layer graph where nodes represent vectors and edges connect similar vectors. This allows nearest neighbor searches by traversing graph edges.
	- Implemented in FAISS and Milvus.
3. Product Quantization:
	- Here the vectors are reduced to a much simpler, lower dimension representation by decomposing them into multiple subvectors.
	- The distances are then calculated based on the lower dimension representation, which are much faster to work with.
	- Implemented in FAISS.
4. IVF (Inverted File Index)
	- Uses K-means clustering to organize similar vectors into the same cluster.
	- The size of the cluster depends on the number of vectors (on an average its 100 to 1000 vectors per cluster).
	- So IVF finds the cluster closest to the query and the vectors of that cluster become the nearest neighbor candidates.
	- Implemented in FAISS (the main backbone of that library).
5. Annoy (Approximate Nearest Neighbors Oh Yeah - I have no idea what the engineers at Spotify were thinking for this one lol)
	- Follows a tree-based approach.
	- It builds binary trees where each tree splits into clusters using a random criteria. So during the search, the tree gets traversed and the nearest neighbors are gathered.
	- *As random as the algorithm sounds, I always thought Spotify ironically has the best recommendation algorithm. The music mixes in their recommended playlists are always so good lol.*

There are other algorithms as well: Microsoft's SPTAG (Space Partition Tree And Graph) and FLANN (Fast Library for Approximate Nearest Neighbors).

Final note on Vector databases: Although these have risen into their own category with RAG, any database which can store vectors can be called a vector database. Many traditional databases have extended or will extend to support vector storage or vector search.

&nbsp;

### :material-progress-star-four-points: **Comparing retrieval algorithms:**

Metrics for evaluating the quality- *Context precision* and *Context recall*

The best way to check if the retrieval algorithms are working best is by keeping a set of documents/data labelled i.e. for a certain query which document should have had the highest score and which ones should have been retrieved. Once that's ready, we can then actually put the algorithm to test and then compare with our labelled data. This process can either be done by humans or AI Judges made for this process.

Author also mentions an important point where we actually have to spend a considerable amount of time to build a retriever in the first place. So when we have 2 parameters like *Indexing* and *Querying*. So the more accurate the index, faster the query is retrieved (and accurately). But that whole process of indexing would take time. This is also the case in vice-versa where performance gets affected when indexing isn't done very accurately for the sake of fast querying.

Finally, there are also certain benchmarks for evaluating this, the 4 main ones are: Recall, Query Per Second (QPS), Build time and Index time.

As a conclusion on comparing retrieval algorithms, the quality of a RAG system should be evaluated both component by component and system as a whole (end-to-end). The following things need to be done:

- Evaluate the retrieval quality.
- Evaluate final RAG outputs.
- Evaluate the embeddings (for embedding based retrieval).

&nbsp;

### :material-progress-star-four-points: **Combining retrieval algorithms:**

Here there were a couple of terms I found interesting, still need to read more on though: Hybrid Search, Reranking and Reciprocal Rank Fusion (RRF).

&nbsp;

### :material-progress-star-four-points: **Retrieval Optimization**

Probably one of the most important questions and we've faced this a lot of times especially while building RAG systems - How can we increase the chances of relevant docs being fetched?

There are different methods like Chunking strategy, Reranking, Query rewriting and Contextual retrieval.

1. Chunking strategy:
	- Size of chunks
	- Overlaps
	- Smaller many chunks VS Larger chunks

2. Reranking:
	- Having different algorithms used in sequence.
	- First having a cheaper, less precise algo to retrieve the docs. Next having a more advance/precise/expensive algo to take the best candidates from the docs.

3. Query Rewriting:
	- Keeping another model to reframe the user query, therefore able to have more context.
	- But this can get complicated if there are no relevant content/docs/knowledge with it.

4. Context retrieval:
	- Adding metadata/context (title, tags, keywords or entire summary - we've seen this in anthropics models) to each chunk.
	- This includes even adding description, captions, title, tags for labelling image data.
	- Fun fact: Apparently retrieval also works best when data is organised in Q&A format (I have tried this personally as well, but it hardly feels like building an "intelligent system" haha).

&nbsp;

### :material-progress-star-four-points: **RAG Beyond Text**

1. Multimodal RAG: For images, videos and audio. Mainly involves having contextual retrieval - Like each of those will have metadata like captions or short descriptions which will help the model understand (So not necessarily processing an image itself but the meta data that comes with it. But now we have some pretty good multimodels.)
2. RAG with Tabular data:
	- Having `Text-to-SQL`, SQL Execution, taking results and having final answers.
	- But we will also have a situation where schemas of many different tables can't fit the context. Therefore we will need to have an additional step where we need to choose which tables need to get selected based on the query.

&nbsp;