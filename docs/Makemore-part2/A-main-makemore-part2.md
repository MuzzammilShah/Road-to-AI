# SET A - LECTURE NOTES

----------

## Introduction

#### **Timestamp**: [00:00:00](https://www.youtube.com/watch?v=TCH_1BHY58I&t=0s) 

In the previous lecture, we had implemented a Bigram character level language model where we took one character and tried to predict the next one. This was all and good if we just wanted to predict two different characters. But we saw that it didn't do very well when we tried to predict words out of it, plus we only implemented a single layer of neuron.
Now, if we go with the same approach (where we did counts and build a graph matrix), for each character the number of matrix rows and columns will increase i.e. from 27x27 to 27x27x27 and so on. 

So now we will be moving on to another model called MLP (Multi Layer Perceptron).

&nbsp;

## Bengio et al. 2003 (MLP language model) paper walkthrough.

#### **Timestamp**: [00:01:48](https://www.youtube.com/watch?v=TCH_1BHY58I&t=108s)


Paper Review: (Now this obviously wasn't the first paper to introduce this, but it was definitely the most influential one)
[Paper Link](https://www.jmlr.org/papers/volume3/bengio03a/bengio03a.pdf)

Now, in the paper they have proposed a word level language model, but we will be implementing it for characters itself - so same approach but as a character level language model.

The modelling approach suggested in the paper is also identical: We use a multi layer NN to predict the next word from the previous one. And we try to maximize the negative log likelihood of the training data.

They are basically proposing a vector dimensional space (3D Space - You can revisit the imagery from [here](https://youtu.be/5Y3a61o0jFQ?si=et_UgAWTBvNH1q7D&t=143) ) where the words most related to each other will be close by. So during testing if the model encounters a sentence which it may not have been trained on, it can still relate to the other words and complete the sentence. So within that embedded space, there is knowledge exchange and outcome is produced. 

*First Explanation of the diagram [5:42](https://youtu.be/TCH_1BHY58I?si=QENgHLg9U5s_3xVR&t=342) with an Overview (Will have to comeback to this as I progress through the lecture, there were some imagery/explanation which I couldn't grasp completely)*

*Update: Yeah it all makes sense now lol*

&nbsp;

## (re-)building our training dataset

#### **Timestamp**: [00:09:03](https://www.youtube.com/watch?v=TCH_1BHY58I&t=543s) 

We are preparing our dataset. Its the same `name.txt` file we used before. 
We have made a slight change to how we formatted the dataset (The < S > and < E >), so here we are adding a `block size` which represents 'How many characters should we consider for predicting the next one'

We've used 3 to follow the diagram in the research paper, the 3 different inputs present horizontally in the diagram at the bottom represent that. **View [page 6](https://www.jmlr.org/papers/volume3/bengio03a/bengio03a.pdf) for the diagram.**

Prepared the X and Y values.

&nbsp;

## Implementing the embedding lookup table

#### **Timestamp**: [00:12:19](https://www.youtube.com/watch?v=TCH_1BHY58I&t=739s) 

(Basically showing a broken down alternative way of implementing this, but ultimately the point is to show how simple and direct it is to do indexing in PyTorch)

In the diagram, we are basically implementing the 'Look up table in C'.
So we have 27 possible characters and we're gonna embed them in a lower dimensional space. In the paper, they had taken 17000 words and crammed it into a 30 dimensional space. So, we'll be doing something like taking 27 characters and cramming them into a 2 dimensional space.

This lookup table `C` will be random numbers, which will have 27 rows and 2 columns. So each one of the 27 characters will have a 2 dimensional embedding: `C = torch.randn((27,2))`

Now, if you look at the diagram, we are indexing each word (our case character) into the look up table `C`. Ultimately, you can see that entire structure as one layer of the NN (the first layer)

So, adding that character to the look-up table is called INDEXING. There is also the method of one-hot encoding them, but we'll be discarding that as its simpler and much faster to do indexing.

So long story short, in order to embed all of `X` (our 27 characters in 2 dimension) into `C`, we simply do `C[X]`

&nbsp;

## Implementing the hidden layer + internals of torch.Tensor: storage, views

#### **Timestamp**: [00:18:35](https://www.youtube.com/watch?v=TCH_1BHY58I&t=1115s) 

Now we try to build the hidden layer. Here we consider the size of the embedding layer `C[X].shape` is `torch.Size([32, 3, 2])`

So we have 2 dimensional embedding layers and there are 3 of them. (Just consider the diagram itself, the 2D ones are the red circles and the 3 of them are the 3 rectangles)

The hidden layer, we will consider as `W1` initializing with a bunch of random numbers. So taking that 2D in 3, we take 6. And for the number of neurons in the hidden layer we can consider any number of our choice, so we take 100.
`W1 = torch.randn((6, 100))`

And we add bias to it `b1 = torch.randn(100)`

Now, normally we would wanna matrix multiply the embeddings with the weights in the hidden layer and add bias to it `emb @ W1 + b1`
(Note: `emb` is basically `C[X]`. So, `emb = C[X]`)

But we can't do that because the shape of `emb` is `[32, 3, 2]` and our `W1` is `[6, 100]`. So we need to somewhat, concatenate all 3 of those into one, so we get 3x2 i.e. 6.

So those 3 different boxes that we have, we want to concatenate all of there values into one. And this is where we use different functions provided by PyTorch.

In PyTorch concatenate function `torch.cat` we have to add the embedding values and then mention to which dimension you want to concatenate them to, hence we are adding that 1 in `torch.cat(----, 1)`

Now instead of adding the embeddings one by one like `torch.cat([ emb[:,0,:], emb[:, 1, :], emb[:, 2, :]], 1)`

we use this torch function called `unbind` which basically returns such a list. So we do `torch.unbind(emb, 1)`. Here also we are mentioning the dimension of each of those values (We are looping through this basically)

So finally we get `torch.size( torch.unbind(emb, 1) ,1)`

But it turns out, even that is not very efficient, as for unbind we are using like a whole different set of memory.

So resolve this, we will be converting the shape of it using PyTorch. So in PyTorch we have something called `.view` where we can change the dimensions as we want. So if the total elements is 18, we can view it as 9x2, 3x3x2, 6x3 anything. The reason is, PyTorch basically puts all the elements in its memory as a single dimensional array i.e. from 0 to 17 in our example. So as long as it's total number of elements remain the same, we can always ask PyTorch to view it in a different shape.

So, instead we go back to the original matrix multiplication equation `emb @ W1 + b1`
We simply just convert the shape of the embedding to match that of W1 for the multiplication, by simply asking PyTorch to view it differently.
`emb.view(32, 6) @ W1 + b1`

Now we don't want to hardcode the value 32 and make it more dynamic, so we instead add `emb.view(shape[0], 6) @ W1 + b1`

or to make it even more efficient we do `emb.view(-1, 6) @ W1 + b1`. So when we had `-1`, PyTorch will itself know that it needs to look for the size and add there.

And finally, since this is the hidden tanh layer, we implement that as well, so `h = torch.tanh(emb.view(-1, 6) @ W1 + b1)`

AND THAT'S OUR HIDDEN LAYER!


(psst.. fun flashback. In the equation we also have the addition of biases to the weights before matrix multiplying them. W1 is `[6, 100]` and b1 is `100`, so here **broadcasting** is happening! so its `[1, 100]` for b1)

&nbsp;

## Implementing the output layer

#### **Timestamp**: [00:29:15](https://www.youtube.com/watch?v=TCH_1BHY58I&t=1755s) 

Now finally lets implement our final layer. So we assign W2 and b2. So W2 takes the input of 100 neurons from the hidden layer and we need the output as 27 as we have 27 characters and the bias is also set to 27.

```
W2 = torch.randn((100, 27))
b2 = torch.randn(27)
```

And finally we calculate the `logits` which is the output of the final layer
```
logits = h @ W2 + b2
```

So finally, our output layer (logits) dimension will be `[32, 27]`

&nbsp;

## Implementing the negative log likelihood loss

#### **Timestamp**: [00:29:53](https://www.youtube.com/watch?v=TCH_1BHY58I&t=1793s) 

Now as we've seen in the part 1 of makemore, we need to take those logits values and first exponentiate them to get our "fake counts" and then normalize them to get the probability.

```
counts = logits.exp()
prob = counts / counts.sum(1, keepdims=True)
```

Now, we have the final piece of this equation, the `Y` for predicting the next possible character.

So now we need to index Y into prob. Now first we need to label Y (i.e. its positioning 0 to 31) so we use `torch.arange(32)` and label them respectively to Y's values.

torch.arange(32) -> 0, 1, 2, 3 ..... 32
Y -> 5, 13, 13, 1 ..... 0

```
prob[torch.arange(32), Y]
```
So now we've indexed Y into the prob

Then we find the log value of it, then its mean and the negative of it to finally get the negative log likelihood value, which is basically our loss value.

```
loss = -prob[torch.arange(32), Y].log().mean()
```

So this is the `loss` value that we would like to minimize, so that we can get the network the predict the next character of the sequence correctly.

&nbsp;

## Summary of the full network

#### **Timestamp**: [00:32:17](https://www.youtube.com/watch?v=TCH_1BHY58I&t=1937s) 

Now we're just putting them altogether (To make it more respectable lol)

```
X.shape, Y.shape #dataset
```

```
g = torch.Generator().manual_seed(2147483647)
C = torch.randn((27,2), generator=g)
W1 = torch.rand((6, 100), generator=g)
b1 = torch.rand(100, generator=g)
W2 = torch.rand((100, 27), generator=g)
b2 = torch.rand(27, generator=g)
parameters = [C, W1, b1, W2, b2]
```

```
sum(p.nelement() for p in parameters) #to check number of parameters in total
```

```
emb = C[X]
h = torch.tanh(emb.view(-1,6) @ W1 + b1)
logits = h @ W2 + b2
counts = logits.exp()
prob = counts / counts.sum(1, keepdims=True)
loss = - prob[torch.arange(32), Y].log().mean()
loss
```

&nbsp;