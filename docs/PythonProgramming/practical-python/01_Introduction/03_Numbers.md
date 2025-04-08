# 1.3 Numbers

This section discusses mathematical calculations.

## Types of Numbers

Python has 4 types of numbers:

* Booleans
* Integers
* Floating point
* Complex (imaginary numbers)

## Booleans (bool)

Booleans have two values: `True`, `False`.

```python
a = True
b = False
```

Numerically, they're evaluated as integers with value `1`, `0`.

```python
c = 4 + True # 5
d = False
if d == 0:
    print('d is False')
```

*But, don't write code like that. It would be odd.*

## Integers (int)

Signed values of arbitrary size and base:

```python
a = 37
b = -299392993727716627377128481812241231
c = 0x7fa8      # Hexadecimal
d = 0o253       # Octal
e = 0b10001111  # Binary
```

Common operations:

```
x + y      Add
x - y      Subtract
x * y      Multiply
x / y      Divide (produces a float)
x // y     Floor Divide (produces an integer)
x % y      Modulo (remainder)
x ** y     Power
x << n     Bit shift left
x >> n     Bit shift right
x & y      Bit-wise AND
x | y      Bit-wise OR
x ^ y      Bit-wise XOR
~x         Bit-wise NOT
abs(x)     Absolute value
```

## Floating point (float)

Use a decimal or exponential notation to specify a floating point value:

```python
a = 37.45
b = 4e5 # 4 x 10**5 or 400,000
c = -1.345e-10
```

Floats are represented as double precision using the native CPU representation [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754).
This is the same as the `double` type in the programming language C.

> 17 digits of precision  
> Exponent from -308 to 308

Be aware that floating point numbers are inexact when representing decimals.

```python
>>> a = 2.1 + 4.2
>>> a == 6.3
False
>>> a
6.300000000000001
>>>
```

This is **not a Python issue**, but the underlying floating point hardware on the CPU.

Common Operations:

```
x + y      Add
x - y      Subtract
x * y      Multiply
x / y      Divide
x // y     Floor Divide
x % y      Modulo
x ** y     Power
abs(x)     Absolute Value
```

These are the same operators as Integers, except for the bit-wise operators.
Additional math functions are found in the `math` module.

```python
import math
a = math.sqrt(x)
b = math.sin(x)
c = math.cos(x)
d = math.tan(x)
e = math.log(x)
```


## Comparisons

The following comparison / relational operators work with numbers:

```
x < y      Less than
x <= y     Less than or equal
x > y      Greater than
x >= y     Greater than or equal
x == y     Equal to
x != y     Not equal to
```

You can form more complex boolean expressions using

`and`, `or`, `not`

Here are a few examples:

```python
if b >= a and b <= c:
    print('b is between a and c')

if not (b < a or b > c):
    print('b is still between a and c')
```

## Converting Numbers

The type name can be used to convert values:

```python
a = int(x)    # Convert x to integer
b = float(x)  # Convert x to float
```

Try it out.

```python
>>> a = 3.14159
>>> int(a)
3
>>> b = '3.14159' # It also works with strings containing numbers
>>> float(b)
3.14159
>>>
```