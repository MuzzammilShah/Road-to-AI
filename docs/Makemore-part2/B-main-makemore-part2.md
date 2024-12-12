# SET B - LECTURE NOTES

----------

## Introducing F.cross_entropy and why

#### **Timestamp**: [00:32:49](https://www.youtube.com/watch?v=TCH_1BHY58I&t=1969s)

Now, after finding/calculating the `logits` value, instead of finding its exponent, then its probability distribution and then the negative log likelihood, we directly use PyTorch's `F.cross_entropy()` - it basically does all of those three steps, but is much more efficient.

Also it turns out, we've only been doing those steps for academic purposes and this won't happen during the actual training of NN. So using `F.cross_entropy()` is makes forward, backward pass much more efficient (and it saves memory of doing all those 3 steps cluttered into one)

So we have this
```
emb = C[X]
h = torch.tanh(emb.view(-1,6) @ W1 + b1)
logits = h @ W2 + b2
counts = logits.exp()
prob = counts / counts.sum(1, keepdims=True)
loss = - prob[torch.arange(32), Y].log().mean()
loss
```

to this
```
emb = C[X]
h = torch.tanh(emb.view(-1,6) @ W1 + b1)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Y)
loss
```

&nbsp;

## Implementing the training loop, overfitting one batch

#### **Timestamp**: [00:37:56](https://www.youtube.com/watch?v=TCH_1BHY58I&t=2276s)

Now we implement the training of the neural net for that set of data (we just took the first five words for now)

Now, we already have the forward pass where we find the value of the loss
```
#forward pass
emb = C[X]
h = torch.tanh(emb.view(-1,6) @ W1 + b1)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Y)
loss
```

Then we calculate the backward pass
```
#backward pass
for p in parameters:
	p.grad = None
loss.backward()
```

Then we update the values
```
#update
for p in parameters:
	p.data += -0.1 * p.grad
```


Now, we want all of this in a loop, so putting them all together:
```
for _ in range(100):
	#forward pass
	emb = C[X]
	h = torch.tanh(emb.view(-1,6) @ W1 + b1)
	logits = h @ W2 + b2
	loss = F.cross_entropy(logits, Y)
	
	#backward pass
	for p in parameters:
		p.grad = None
	loss.backward()
	
	#update
	for p in parameters:
		p.data += -0.1 * p.grad

print(loss.item())

```

Finally, just before this entire process, we need to declare `requires_grad` parameter to `True`
```
for p in parameters:
	p.requires_grad = True
```

&nbsp;

## Training on the full dataset, minibatches

#### **Timestamp**: [00:41:25](https://www.youtube.com/watch?v=TCH_1BHY58I&t=2485s) 

First we try to train on the entire dataset, we noticed that the loss was decreasing but there was a fair bit of lag during each step. So the gradient is moving in the right direction but with much larger time and steps.

So we split them into mini batches, and only send those sets of batches for training and then we noticed that the training is almost instant.

This is a much better practice to follow, as "it is much better to take the approximate gradient and make more steps; then taking the exact gradient with fewer steps."

&nbsp;

## Finding a good initial learning rate

#### **Timestamp**: [00:45:40](https://www.youtube.com/watch?v=TCH_1BHY58I&t=2740s) 

So, in the update section we had just randomly guessed a value for the learning rate, we put it as `0.1`. But there is also a way to determine the best possible learning rate.

So we set like a range of values like the exp of -3 to exp of 0 (that is basically 0.001 to 1) and then plot a graph to see where the value gets the lowest.

```
lre = torch.linspace(-3, 0, 1000)
lrs = 10**lre
```
```
#Remember to reset the parameters and only then run this

lri = []
lossi = []

for i in range(1000):

    #Minibatch
    xi = torch.randint(0, X.shape[0], (32,))

    #forward pass
    emb = C[X[xi]]
    h = torch.tanh(emb.view(-1,6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Y[xi])
    #print(loss.item())

    #backward pass
    for p in parameters:
        p.grad = None
    loss.backward()

    #update
    lr = lrs[i]
    for p in parameters:
        p.data += -0.1 * p.grad

    #keeping track
    lri.append(lre[i]) #We are taking the exponent of the learning rate for the x-axis
    lossi.append(loss.item())

print(loss.item())
```
```
plt.plot(lri, lossi)
```

So seeing the graph, we had closely to `0.1` (although it can be lower for me as I had a lower loss value to begin with) and so we continue with that value.

We kept on training till the loss reduces and once we feel like we were close, we made the learning rate more smaller (this is called learning rate decay).

So this is not exactly how we do in production, but the process is the same. We decide on a learning rate, train for a while and towards the end we do like a learning rate decay and then finally we get a trained neural net!

(Also, we have surpassed the loss value we got in the bigram model! So we've already made improvements)

&nbsp;