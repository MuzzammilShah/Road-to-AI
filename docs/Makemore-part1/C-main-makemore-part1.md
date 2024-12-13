
-----
--------

###### **SUB-CHAPTER** [01:33:13](https://youtu.be/PaCmpygFfXo?si=V2C7LeM4z3eZS8Vi&t=5593) Now we are gonna fine-tune the W to optimize/minimize the loss, so we find a good value of W using gradient based optimization

Recap of micrograd, revised the forward pass, backward pass and the calculation of the loss value. 

**Note: In Micrograd, we had built everything from scratch. The Value object, Calculation functions (for forward and backward) passes. Here we'll be using PyTorch itself, so it's a direct syntactical application.**

&nbsp;

##### **CHAPTER** [01:35:49](https://www.youtube.com/watch?v=PaCmpygFfXo&t=5749s) vectorized loss
First in the forward pass, we have to calculate the loss value. Now, unlike in Micrograd where we used Mean Squared Error, here we'll use the Negative Log Likelihood.
Because there is was a Regression problem, now it is a classification one.

Here we are basically seeing what is the probability value that the model assigns to the next occurring character in the sequence.
So `xs` is the first character and `ys` is the next occurring character, so we check the probability value according to that.

&nbsp;

##### **CHAPTER** [01:38:36](https://www.youtube.com/watch?v=PaCmpygFfXo&t=5916s) backward and update, in PyTorch
**Backward:**
We calculated the backward pass. First we get the grad values to zero and then backpropagate through (Using PyTorch, so it is a lot more easier).
Finally we get the W.grad values. Now those values (essentially weights) tells us how much influence they have on the final output loss value. So if it is positive and we add more to it, the loss value will increase.

**Update:**
Finally, here we just update the W.data values, basically nudging them slightly to decrease the loss value.

Then finally we can perform the gradient descent cycle. After we update the value, when we do forward pass again, it should slightly decrease the loss value.
###### **So when we achieve low loss, it means that the NN is assigning high probabilities to the next correct character.**

&nbsp;

##### **CHAPTER** [01:42:55](https://www.youtube.com/watch?v=PaCmpygFfXo&t=6175s) putting everything together
We put all of the codes and process we have done right now all together. We can see how it is more efficient to perform these steps using a neural network. 

**Here is it a very simple problem, as we are only predicting the next character (so there is only 2 in total) but when it increases, this entire step actually almost remains the same!** 

**Just that the way we calculate the `logits` in forward pass changes!**

```
# create the dataset

xs, ys = [], []

for w in words:

  chs = ['.'] + list(w) + ['.']

  for ch1, ch2 in zip(chs, chs[1:]):

    ix1 = stoi[ch1]
    ix2 = stoi[ch2]
    xs.append(ix1)
    ys.append(ix2)

xs = torch.tensor(xs)
ys = torch.tensor(ys)
num = xs.nelement()
print('number of examples: ', num)

# initialize the 'network'
g = torch.Generator().manual_seed(2147483647)
W = torch.randn((27, 27), generator=g, requires_grad=True)
```

```
# gradient descent

for k in range(20):

  # forward pass
  xenc = F.one_hot(xs, num_classes=27).float() # input to the network: one-hot encoding

  logits = xenc @ W # predict log-counts #THIS STEP HERE!
  counts = logits.exp() # counts, equivalent to N
  probs = counts / counts.sum(1, keepdims=True) # probabilities for next character

  loss = -probs[torch.arange(num), ys].log().mean() + 0.01*(W**2).mean()

  print(loss.item())

  # backward pass
  W.grad = None # set to zero the gradient
  loss.backward()

  # update
  W.data += -50 * W.grad
```

&nbsp;

##### **CHAPTER** [01:47:49](https://www.youtube.com/watch?v=PaCmpygFfXo&t=6469s) note 1: one-hot encoding really just selects a row of the next Linear layer's weight matrix
##### **CHAPTER** [01:50:18](https://www.youtube.com/watch?v=PaCmpygFfXo&t=6618s) note 2: model smoothing as regularization loss

So the above 2 chapters were like these additional notes where he compares how the steps we followed during the manual steps is almost exactly similar to the NN approach. Pretty cool, but I guess I'll understand it a lot better if I watch it a couple of more times.

**But the second chapter (1:50:18) he had done a step called 'Regularization loss' where he added like this additional line to our NLL calculation (This is already added in our above code)**
**`loss = -probs[torch.arange(num), ys].log().mean() + 0.01*(W**2).mean()`**

**This part: `+ 0.01*(W**2).mean()` This basically helped with the smoothening (Like how we did in the manual process of adding value to N, either 1,2 or 1000. So they all become uniform/smoothened)**

&nbsp;

##### **CHAPTER** [01:54:31](https://www.youtube.com/watch?v=PaCmpygFfXo&t=6871s) sampling from the neural net
Finally here we just saw how sampling from this model produces the outputs (Spoiler alert: it will be the same as how we made the model manually, coz... it is the same model just that we made it using Neural nets) :)

&nbsp;

##### **CHAPTER** [01:56:16](https://www.youtube.com/watch?v=PaCmpygFfXo&t=6976s) conclusion

We introduced the bigram character level language model.
We saw how we could: Train the model, Sample from the model and Evaluate the quality of the model using the Negative Log Likelihood (NLL) loss.
We actually trained the model in two completely different ways that actually gave the same result (and the same model)
In the first way, we just counted up the frequency of all the bigrams and normalized.
In the second way, we used the NLL loss as a guide to optimizing the counts matrix(The blue table matrix)/counts array so that the loss is minimized in a gradient based framework.
We saw that both of them gave the same result.