## Sampling Brownian Motion

The following code shows how we can code a Brownian motion. As a reminder, a stochastic process \( \{ B(t), t \geq 0 \} \) is said to be a Brownian motion if it satisfies the following properties:

1. \( B(0) = 0 \) almost surely.
2. The process has continuous sample paths, meaning \( B(t) \) is continuous in \( t \).
3. The increments \( B(t) - B(s) \) are stationary and independent for all \( 0 \leq s \lt t \).
4. \( B(t) - B(s) \) follows a normal distribution with mean \( 0 \) and variance \( t - s \) for all \( 0 \leq s \lt t \).

```python
class BrownianMotion:
    def __init__(self, mu, sigma):
        self.mu = mu
        self.sigma = sigma

    def sample_path(self, t_0=0, t_1=1, nofpoints=1000):
        dt = (t_1-t_0)/nofpoints
        time_vector = np.linspace(t_0, t_1, nofpoints)
        normal_vector = np.random.normal(0, 1, nofpoints-1)

        result = np.zeros(nofpoints)
        result[0] = self.mu * t_0
        result[1:] = self.sigma
        * np.cumsum(normal_vector)
        * np.sqrt(dt) + time_vector[1:]
        * self.mu
        return time_vector, result

    def sample(self, time_vector):
        nofpoints = time_vector.size
        normal_vector = np.random.normal(0, 1, nofpoints-1)
        * np.sqrt(np.diff(time_vector))

        vals = np.zeros(nofpoints)
        vals[0] = self.mu + time_vector[0]
        vals[1:] = self.sigma * np.cumsum(normal_vector)
        + time_vector[1:] * self.mu
        return vals
```

<!-- figure: A Simple Plot of the Standard Brownian Motion -->
<img alt="" height="auto" src="/Figures/1002.png" width="100%" />

<!-- separator -->