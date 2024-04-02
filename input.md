### Stirling's Approximation but Weaker

Show that 
\[
\lim_{n\to \infty} \frac{n^n}{e^nn!} = 0.
\]

<!-- begin solution -->
Fix \(k\in \mathbb N\). According to the power series representation of the exponential function we should have:
\[
\begin{align}
e^n
&= 1 + n + \frac{n^2}{2!} + \cdots + \frac{n^n}{n!} + \frac{n^{n+1}}{(n+1)!} + \cdots\notag\\
&\gt \frac{n^n}{n!}\left(1 + \frac {n}{n+1} + \frac {n^2}{(n+1)(n+2)}+ \cdots\right)\notag\\
&\gt \frac{n^n}{n!}\left(1 + \frac {n}{n+1} + \cdots + \frac {n^k}{(n+1)\cdots(n+k)}\right).
\end{align}
\]
Therefore, (1) gives
\[
\liminf_{n\to \infty} \frac{e^nn!}{n^n} \gt k
\]
and The conclusion follows from the fact that $k$ was an arbitrary number.
<!-- end solution -->