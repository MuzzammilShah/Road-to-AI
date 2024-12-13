
### Addressing some conditions:

#### Condition 1-
First, we cannot multiply a number/constant directly with a Value variable, as in our __ add __ () functions, it takes the data of the object, i.e. self.data or other.data

Therefore, when we do:
```
a = Value(2.0)
b = a + 2
```

This won't work as Value object cannot be added to a constant or this integer variable (Similarly for a * 2)


Therefore, we add this condition:
```
other = other if isinstance(other, Value) else Value(other)
```
*Note: we add this for both add and mul functions*

So here, we first check if 'other' (Which is the second parameter passed in the arguments of for eg: def __ add __ (self, other): ), we check if it is a Value object or not, else we turn it into a Value by wrapping the object around it.

#### Condition 2-
Now in the above condition, we multiplied a Value variable with a constant. 
If we do it the other way round, i.e. 2 * a, it won't work, as python thinks it is the same thing. 

So, what we do is that we add this kind of a 'fallback function', where if there is a condition where **2 can't be multiplied by a**, then python checks if **a can be multiplied by 2**, i.e. in reverse.

Therefore,
```
def __rmul__(self, other):   #other * self
	return self * other
```

--------
### Expanding Tanh:

#### First we start with the exponential part-

So, we take what we wrote for tanh and first start with writing the function just for the exponential part

```
def exp(self):

        x = self.data
        out = Value(math.exp(x), (self, ), 'exp')   #We merged t and out, into just out

        def backward():
          self.grad += out.data * out.grad

        out._backward = backward

        return out
```

Now here, the derivative of e^x is ex. Which is what we are getting in out, therefore we add the 'out.data' value there itself.


#### Division part:

Now, instead of doing just for division operation, we are taking this kind of a special case which could act as a common ground.

To explain:
```
a / b    #This is the normal a divided by b
a * (1/b)    #Which can also be written this
a * (b**-1)    #Which again can be written like this

#So we are trying the achive the second half of the third alternative, i.e.
 b ** -1
#so we are trying to get an equation for 
 b ** k #Where k is a constant
```

So now we can even do calculations where equations have 'to the power of' values.

And if it is just divide, when we change the k value to -1 (We will have a kind of a fallback function for this as well, called __ truediv __() )

Therefore writing the division function as (power - pow):
```
def __pow__(self, other):

	assert isinstance(other, (int, float)), "only supporting int/float powers for now"
	out = Value(self.data ** other, (self, ), f"**{other})


	def backward():
		self.grad += (other * (self.data ** (other - 1))) * out.grad

	out._backward = backward
	return out
```

Here we are using the power rule in derivatives:

d/dx (x^n) = nx^(n-1)

Lastly, we add this function for divide:
```
def __truediv__(self, other):  #self/other
	return self * other**-1
```


#### Finally, Subtraction part:

First we add our kind of fallback functions to handle subtraction, i.e. the second value will have a negative number
```
def __neg__(self):
	return self * -1

def __sub__(self, other):  #self - other
	return self + (-other)
```

So, when subtraction is called, we add self with the negation of other. To calculate or find what the negation of a number is, we call __ neg __ ()

Therefore, no backward function here, as we are ultimately performing the addition operation itself.

---------

Now that all of this is done, we update our Value object.

Then we change the way we want 'o' in our examples. Therefore we will convert the 'tanh' into it's various expression (One of its derivative expression in fact => (e^2x -1) / (e^2x +1) )
[Notebook](../9_expanding_tanh_into_more_operations.ipynb)
