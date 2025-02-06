---
layout: default
title: "Hello there and welcome! 😄"
author_profile: true
---

<!-- Page Header -->
<div class="container mt-4">
  <h1 class="text-center">Hello there and welcome! 😄</h1>
  <p class="text-center">
    I am an Assistant Professor at the <a href="https://www.liverpool.ac.uk/management/" target="_blank">University of Liverpool Management School</a>, and I am also affiliated with <a href="https://www.lusem.lu.se/" target="_blank">Lund University School of Economics and Management</a>.
  </p>
</div>

<!-- About Section -->
<div class="container mt-4">
  <div class="row">
    <div class="col-md-4 text-center">
      <img src="https://via.placeholder.com/200" alt="Yousef Kaddoura" class="rounded-circle img-fluid">
      <p class="mt-2"><strong>Yousef Kaddoura</strong><br>Assistant Professor of Econometrics</p>
    </div>
    <div class="col-md-8">
      <h2>About Me</h2>
      <p>🏫 I received my Ph.D. from <a href="https://www.lu.se/" target="_blank">Lund University</a> in May 2024. Additionally, I hold an M.Sc. in Economics and an M.Sc. in Finance from <a href="https://www.lu.se/" target="_blank">Lund University</a>.</p>
      <p>🧑‍🔬 <strong>Research interests:</strong> Econometrics, Machine learning, Panel Data, Large factor models, Regularization techniques, Clustering/Grouping, Structural breaks, and Finance.</p>
    </div>
  </div>
</div>

<!-- Interactive Research Interests Section -->
<div class="container mt-5">
  <h2 class="text-center">Research Interests</h2>
  <div style="width: 400px; height: 300px; margin: auto;">
    <canvas id="researchChart"></canvas>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const ctx = document.getElementById('researchChart').getContext('2d');
  const researchChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ['Econometrics', 'Machine Learning', 'Panel Data', 'Finance'],
          datasets: [{
              data: [30, 25, 20, 25],
              backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'],
          }]
      }
  });
</script>

<!-- Publications Section -->
<div class="container mt-5">
  <h2>Publications</h2>
  <p>Here is a list of my selected publications:</p>
  <ul>
    {% for publication in site.data.publications %}
      <li>
        <strong>{{ publication.title }}</strong> <br>
        <small>Authors: {{ publication.authors }} | Published in: {{ publication.journal }} ({{ publication.year }})</small><br>
        <a href="{{ publication.link }}" target="_blank">View Paper</a>
      </li>
    {% endfor %}
  </ul>
</div>

<!-- Contact Section -->
<div class="container mt-5">
  <h2>Contact Me</h2>
  <p>Feel free to reach out via the following platforms:</p>
  <ul>
    <li>Email: <a href="mailto:example@domain.com">example@domain.com</a></li>
    <li><a href="https://scholar.google.com" target="_blank">Google Scholar</a></li>
    <li><a href="https://www.linkedin.com" target="_blank">LinkedIn</a></li>
  </ul>
</div>

<!-- Footer -->
<footer class="text-center mt-5 mb-4">
  <p>&copy; {{ site.time | date: '%Y' }} Yousef Kaddoura. All rights reserved.</p>
</footer>
