
Now we will be building a single neural net. It is basically the diagram we've been seeing for NN, where there is an Input layer, Hidden layers and Output layers.

Note: Also remember that [simple diagram](https://cs231n.github.io/assets/nn1/neuron_model.jpeg) with a circle in the middle where they show the summation of product of weights & inputs with the bias along with an activation function added to produce an output (That is essentially what we are creating here)

This process/lecture is divided into 4 stages, each interconnected to each other but broken down for understanding purpose.

----------
---------
### STAGE 1: Defining a simple Neuron

```
class Neuron:

	def __init__(self, nin):
		self.w = [ Value(random.uniform(-1,1)) for _ in range(nin) ]
		self.b = Value(random.uniform(-1,1))

	def __call__(self, x):
		# (w*x)+b
		act = sum( (wi*xi for wi,xi in zip(self.w, x)), self.b )
		out = act.tanh()
		return out

x = [2.0, 3.0]
n = Neuron(2)
n(x)
```

This Python code is defining a very simple "neuron" using OOPS.
We've first made a class which will make/define a single NEURON.

**'__ init __ method':**

This is the **constructor** of the class, and it's called when we create a new neuron object. There are two things happening inside it:

1. **Inputs and Weights (self.w):** When you create a neuron, you specify how many inputs (nin) it will receive.

	In our case, we create a neuron with 2 inputs: `[2.0, 3.0]` (the last part of the code). The ones in the list are the x values, but we explicitly mention the number of inputs in the Neuron(2) which is the name of the class itself, hence the init method will be called then.

	Each of these inputs will be multiplied by a corresponding _weight_. A weight is like the importance of an input. If one input is more important, its weight will be larger.

	So first, in self.w we initialize the weight as random values between -1 and 1.

2. **Bias (self.b):** Besides the inputs and their weights, neurons also have something called a **bias**. This bias is like an extra nudge the neuron gets to help it make better decisions.

	Here too in the code we randomly initialize the bias between -1 and 1.


**'__ call __ method':**

This is where the actual calculation happens when you pass inputs through the neuron. We had made the structure of the Neuron in the init method, and now we perform our mathematical expression calculations here.

1. **Inputs Multiplying Weights (`wi * xi`):**

	Here each input (`x`) multiplied by its corresponding weight (`self.w`).
	
	The line `zip(self.w, x)` simply pairs the weights with the inputs.
		So basically, if `self.w = [0.5, -0.2]` and `x = [2.0, 3.0]`, then it will be calculated as => (0.5 * 2.0) + (-0.2 * 3.0)

2. **Summing the Results (`sum(wi * xi)`):**

	After multiplying the inputs by their respective weights, we add them up to get a **combined score**.

3. **Adding the Bias (`+ self.b`):**

	To the combined score from the inputs and weights, we add the bias. This bias can help shift the score slightly in one direction or the other.


**So all these 3 steps we have merged into a single line of code**
```
act = sum( (wi*xi for wi,xi in zip(self.w, x)), self.b )
```


4. **Activation Function (tanh):**

	Finally, we apply the **activation function**. Here, the function used is `tanh`, which squeezes the output between -1 and 1.

	Explanation on Activation function-
	Imagine the result going through a "gate" that controls how strong the neuron’s final decision is, making sure it's not too big or too small.
	
	**`tanh` has a nice property of pushing values that are too large or too small closer to the boundaries (-1, 1).** If you imagine a spring, the more you pull it in one direction, the harder it is to pull further, which stops it from becoming too extreme.


Finally, in this last part of the code (So that we can understand how this class runs individually)
- **Inputs:** You are giving the neuron two inputs: `2.0` and `3.0`.
- **Neuron:** You create a neuron that expects 2 inputs (`Neuron(2)`).
- **Calling the Neuron:** Finally, you pass the inputs to the neuron using `n(x)`, which will use the weights, bias, and `tanh` to return an output.

--------

### STAGE 2: Defining Hidden Layer(s)

Now we are moving from a single neuron to a **hidden layer** of neurons.
A hidden layer is just a **collection of neurons** working together, where each neuron processes inputs and produces outputs.

```
class Layer:
	def __init__(self, nin, nout):
		self.neurons = [Neuron(nin) for _ in range(nout)]

	def __call__(self, x):
		outs = [n(x) for n in self.neurons]
		return outs
```

**'__ init __ method':**

Here again, this is a constructor which initializes the layer.

1. **Inputs (`nin`) and Outputs (`nout`):**

	The `nin` is the number of inputs coming into the layer, and `nout` is the number of neurons in the layer.

	`self.neurons = [Neuron(nin) for _ in range(nout)]`: This line is creating a list of neurons, one for each output.
	If `nout = 4`, it creates 4 neurons, each expecting 3 inputs (or however many `nin` represents).


**'__ call __ method':**

Now, this Layer contains many neurons. So we are performing the actions on each of the neuron one by one. Therefore we are calling the Neuron class we had defined in stage 1. 

1. `outs = [n(x) for n in self.neurons]`: This line says: "Take each neuron (`n`) in the layer and pass the inputs (`x`) to it." It loops over every neuron and gets the output from each one.

	The result, `outs`, is a list of outputs—one from each neuron. So, if you have 4 neurons in this layer, you’ll get a list of 4 outputs.

So **each neuron in the layer is receiving the same inputs, but each making its own unique decision based on its weights and bias** and providing the respective output.


--------

### STAGE 3: Creating a Multi-Level Perceptron

This is how the staging process has gone: Single Neuron → Layer of Neurons → Multiple Layers of Neurons
Now we'll be connecting all of them together.

```
class MLP:
	def __init__(self, nin, nouts):
		sz = [nin] + nouts
		self.layers = [ Layer(sz[i], sz[i+1]) for i in rangle(len(nouts)) ]

	def __call__(self, x):
		for layer in self.layers:
			x = layer(x)
		return x
```

**'__ init __ method' (Constructor):**
This method is responsible for setting up the structure of the MLP (i.e., the different layers).

1. **Input Size (`nin`) and Layer Sizes (`nouts`):**

	- `nin` is the number of inputs going into the network (like the input size).
	
	- `nouts` is a list that defines the number of neurons in each layer of the network.
		For example, `[4, 3, 2]` means the first hidden layer has 4 neurons, the second hidden layer has 3 neurons, and the final output layer has 2 neurons.

2. **Building the Layers:**

	- `sz = [nin] + nouts`: This line simply creates a list that contains the input size followed by the sizes of all the layers.
		If `nin = 2` and `nouts = [4, 3]`, then `sz = [2, 4, 3]`, where 2 is the number of inputs, 4 is the number of neurons in the first hidden layer, and 3 is the number of neurons in the next layer.
    
	- `self.layers = [Layer(sz[i], sz[i+1]) for i in range(len(nouts))]`: This line loops through the `sz` list and creates each layer. Each layer is constructed by taking the **number of inputs** from `sz[i]` and the **number of neurons in that layer** from `sz[i+1]`.
    
		For example, if `sz = [2, 4, 3]`, this means:
        - The first layer takes 2 inputs and has 4 neurons.
        - The **second layer takes 4 inputs (which are the outputs from the first layer) and has 3 neurons.**
        
    Similarly, when more layers need to be added, the similar process is followed


**'__ call __ method':**
This method runs the forward pass through the network, where data passes through each layer, one after the other.

1. **Processing the Input (`x`) Through Each Layer:**

	`for layer in self.layers: 
		`x = layer(x)`
	
	- The input `x` is passed to the first layer, which processes it using its neurons.
	- Then, the output of that layer becomes the input to the next layer.
	- This continues for each layer, passing the outputs from one layer as inputs to the next.
	- After the input has passed through all the layers, the final output is returned.

	**Note:**
	This loop processes **one entire layer** at a time, not neuron by neuron. When it’s processing a layer:

	- **All the neurons in that layer receive the same input** (which is the output of the previous layer).
	- **All neurons in the layer independently calculate their outputs** (in parallel).
	- The **outputs of all neurons in the layer are collected** and passed as a single new input to the next layer.

	Now that is passed here in STAGE 2 function:
	`outs = [n(x) for n in self.neurons]`

	This means:
	- Each neuron (`n`) in the layer gets the same input (`x`).
	- Each neuron processes the input **at the same time** and independently.
	- The outputs from all neurons in this layer (first hidden layer) are collected into a list (`outs`).

--------

### STAGE 4: COMBINING ALL OF THEM TOGETHER

Final code will look like this:

```
class Neuron:

	def __init__(self, nin):
		self.w = [ Value(random.uniform(-1,1)) for _ in range(nin) ]
		self.b = Value(random.uniform(-1,1))

	def __call__(self, x):
		# (w*x)+b
		act = sum( (wi*xi for wi,xi in zip(self.w, x)), self.b )
		out = act.tanh()
		return out

class Layer:
	def __init__(self, nin, nout):
		self.neurons = [Neuron(nin) for _ in range(nout)]

	def __call__(self, x):
		outs = [n(x) for n in self.neurons]
		return outs

class MLP:
	def __init__(self, nin, nouts):
		sz = [nin] + nouts
		self.layers = [ Layer(sz[i], sz[i+1]) for i in range(len(nouts)) ]

	def __call__(self, x):
		for layer in self.layers:
			x = layer(x)
		return x
```
*(Also import random)*

Now, lets pass the values to create the entire neural network of this and make it work!

```
x = [2.0, 3.0, -1.0]
n = MLP(3, [4, 4, 1])
n(x)
```
x is the input values
n ->
- The number of input values provided is mentioned (so its 3 in our case, as provided in x)
- Next we mention how many layers we want and in each of those layers how many neurons must be there. 
	So the number of layers needed, will be the length of the list given (If you count, there are 3 values there in total, so 3 layers).
	We also mention how many neurons should be there in each of those layers (So in this case we want 4 - 4 - 1)

This [diagram](https://cs231n.github.io/assets/nn1/neural_net2.jpeg) is essentially what we have recreated here :)

----
----

Now, this is just the forward pass implementation (You will notice that the grad values are still 0.0)
So next that is what we will be working on! :))