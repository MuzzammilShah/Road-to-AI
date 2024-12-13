

Take a look at these images:
[Simple Neural Net](https://imgs.search.brave.com/vbceVtaIZJofYe6CBBGZ8fIuDGyI6ICi9EkhTeZfZCc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jczIz/MW4uZ2l0aHViLmlv/L2Fzc2V0cy9ubjEv/bmV1cmFsX25ldDIu/anBlZw)
[Neuron Mathematical Model](https://imgs.search.brave.com/eGlTokdhbINxZOKkAUnAz_Cu-grWMt7LkMKJoi66gdQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jczIz/MW4uZ2l0aHViLmlv/L2Fzc2V0cy9ubjEv/bmV1cm9uX21vZGVs/LmpwZWc)

#### Neuron Mathematical Model:


**INPUTS:**
You have these neurons as inputs which are the 'x'

Then there are the synapse, which are the weights as 'w'

So the synapse interacts with the neurons multiplicatively.

So, what flows into the 'cell body' is w times x

But there are multiple of it, so many w times x 
Eg in the image: w0x0, w1x1, w2x2



**CELL BODY:**
It takes in the product of those inputs.
It also contains some bias 'b' - This is like a innate trigger happiness for the neuron. So the bias can make it a bit more trigger happy or a bit less trigger happy, regardless of the input.

So now if you see,

We have the summation of all the inputs (w.x) added with the bias 'b' and we take it through an activation function 'f'

Now this activation function 'f' is usually like a squashing function, like sigmoid or tanh.

We'll be using tanh for our example.
*numpy has np.tanh which we can call in code.*

```
plt.plot(np.arange(-5,5,0.2), np.tanh(np.arange(-5,5,0.2))); plt.grid();
```
[Output graph](https://imgs.search.brave.com/ZZNUZ770vaU8kqKGqLR9DL7RI7eTbgSjHdLDqM2HIdk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YmFlbGR1bmcuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy9zaXRl/cy80LzIwMjIvMDIv/dGFuaC5wbmc)

So, you will see that the inputs we are adding gets squashed at the y-coordinate (at the middle)
Therefore at 0, it becomes 0
When it's more positive in the input, it is pushed upto 1 only and then smoothens out there.
When it is negative, its is flattened out at -1 itself



**OUTPUTS:**

So what comes out as an output is the activation function 'f' applied as a dot product the sum of the weight of the inputs.

---------
Now, we'll be implementing this in code.