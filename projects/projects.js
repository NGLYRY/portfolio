import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

const projectsTitle = document.querySelector('.projects-title')

projectsTitle.textContent = `Projects (${projects.length})`;

renderProjects(projects, projectsContainer, 'h2');

// let arcGenerator = d3.arc().innerRadius(20).outerRadius(50);

// let rolledData = d3.rollups(
//     projects,
//     (v) => v.length,
//     (d) => d.year,
//   );

//   let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
//   });

// let sliceGenerator = d3.pie().value((d) => d.value);

// let arcData = sliceGenerator(data);

// let arcs = arcData.map((d) => arcGenerator(d));

// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// arcs.forEach((arc, idx) => {
//     // TODO, fill in step for appending path to svg using D3
//     d3.select('svg')
//     .append('path')
//     .attr('d', arc)
//     .attr('fill', colors(idx))
//     ;
//   })

// let legend = d3.select('.legend');

// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`)
//           .attr('class', 'block') // set the style attribute while passing in parameters
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// })

let query = '';

let searchInput = document.querySelector('.searchBar');
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render filtered projects
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });



// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year }; // TODO
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newarcGenerator = d3.arc().innerRadius(20).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => newarcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    // TODO: clear up paths and legends

    d3.select('svg').selectAll('path').remove();
    // d3.select('svg').selectAll('g').remove();
    
    // update paths and legends, refer to steps 1.4 and 2.2
    let newlegend = d3.select('.legend');
    newArcs.forEach((arc, idx) => {
        d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        ;
      })

      newlegend.selectAll('li').remove();

      newData.forEach((d, idx) => {
        newlegend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .attr('class', 'block') // set the style attribute while passing in parameters
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
        })
  }
  
  // Call this function on page load
  renderPieChart(projects);
  

  searchInput.addEventListener('change', (event) => {
    query = event.target.value;
    let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });
