

First we will be building the 'Value' object which we had seen in the [micrograd-functionality](micrograd-functionality.md) explanation example.

```
class Value:

	# So Value object takes a single scalar value that it stores and keeps track of
    
    def __init__(self, data):
        self.data = data

	# Python uses this repr function internally, to return the below string
    
    def __repr__(self):
        return f"Value(data={self.data})"
```


```
a = Value(2.0)  # So now this is a Value object whose data equals 2

a

  

b = Value(-3.0) #Another Value object

b
```

```
a + b

# Here when we try to add, it throws an error as right now python doesn't know how to add our two Value object

"""
TypeError: unsupported operand type(s) for +: 'Value' and 'Value'
"""
```

Therefore, in order to resolve that,
```
# Python will call these internal __add__ operator to perform the addition
def __add__(self, other):

        out = Value(self.data + other.data)
        return out
```

So, when we call 'a+b' -> python internally calls -> a.__ add __ (b)
Therefore now, the addition in *(self.data + other.data)* happens as its usual floating point values addition.

Note: The repr function basically allows us to print nicer looking expressions. If that was not there, in the output we'll get some random gibberish output instead of what we actually want to be printed like: Value(data=-1.0)

-----------------

### Visualization of the expression

That is we will be producing graphs i.e. to keep points of what values produce these other values. (That will act as the connecting tissue of these expressions)

Therefore in the final expression code that we had made:
```
class Value:

    def __init__(self, data, _children=()):
        self.data = data
        self._prev = set(_children)

    def __repr__(self):
        return f"Value(data={self.data})"

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other))
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other))
        return out
```

```
a = Value(2.0)
b = Value(-.3.0)
c = Value(10.0)

d = a*b + c
d
```
Here, _ children was used for efficiency and by default it stores an empty tuple (This is just for convenience) but when we use it in the class it will be stored as a set.

Inside however we call the different function _ prev  and store that children set. *(So, in the above expression, it basically stores the result of the sub expressions, like a mul b and value of c.)*

```
d._prev
```
The above cell would return:
{Value(data=-6.0), Value(data=10.0)}


Now, we know the children that were created as a value.

But we still don't know what operation created those values, therefore

```
class Value:

    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self._prev = set(_children)
        self._op = op

    def __repr__(self):
        return f"Value(data={self.data})"

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other), '+')
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other), '*')
        return out
```

```
d._op
```
The above cell will show the final operation that was done to produce 'd' which was '+'

----------

Now we have:
- Full Mathematical expression
- Build the all the data structures to hold it
- We know how all of these values came to be, in the form of what expression and from what other values

-------------
### Visualization of the expression continued


Made the visual graphs for the nodes of the NN. I have split it into two notebooks as I had to use Google Colab for graphviz.
[Notebook](../3_1-graph-visualisation.ipynb)

------
----------
## SUMMARY & WHAT TO DO NEXT:

- We have given various inputs like a, b, f that going into a mathematical expression and generate a single output L. **The entire graph generated visualizes a Forward Pass.** So, the output of the forward pass is -8 (the final value obtained in L)

- **Next we would like to run Back propagation.**

- **We are going to calculate the derivative of every single value/node w.r.t L**

- **In Neural Networks of course we will be interested in finding the derivative of the Loss Function 'L' w.r.t to the weights of the neural networks e.g. in the above graph the weights of each of those nodes.**

- **Usually we do not consider the initial values to find the derivate of the loss function with, as they were fixed. E.g. a & b**

- **So it's the weights that will be iterated on E.g. c, e, d, f**

- Therefore during initialization, the gradient values will be set to 0 as we believe that those initial values do not affect the value of the output.
