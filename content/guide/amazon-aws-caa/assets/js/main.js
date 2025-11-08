// IT HUB – AWS CAA: interacción mínima
(function(){
  const btn = document.getElementById('toggleTheme');
  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    });
  }
  // persist theme
  const pref = localStorage.getItem('theme');
  if (pref === 'light') document.body.classList.add('light');

  // Flashcards
  const flashEl = document.getElementById('flashcard');
  if (flashEl) {
    fetch('data/flashcards.json').then(r=>r.json()).then(cards => {
      let current = 0, showA = false;
      const qBtn = document.getElementById('nextFlash');
      const aBtn = document.getElementById('showAnswer');
      const render = () => {
        const item = cards[current];
        flashEl.innerHTML = '<strong>Pregunta:</strong> ' + item.q + (showA ? '<br/><em>Respuesta:</em> ' + item.a : '');
      };
      const next = () => { current = Math.floor(Math.random()*cards.length); showA=false; render(); };
      if (qBtn) qBtn.onclick = next;
      if (aBtn) aBtn.onclick = () => { showA = true; render(); };
      next();
    }).catch(()=>{
      flashEl.textContent = 'No se pudieron cargar las flashcards.';
    });
  }

  // Quiz simple
  const startQuiz = document.getElementById('startQuiz');
  const quizEl = document.getElementById('quiz');
  if (startQuiz && quizEl) {
    const questions = [
      { q: '¿Qué servicio usarías para ejecutar código sin gestionar servidores?', a: 'Lambda', opts:['EC2','ECS','Lambda','Beanstalk'] },
      { q: '¿Qué almacenamiento es de objetos?', a: 'S3', opts:['EBS','EFS','FSx','S3'] },
      { q: '¿Qué servicio proporciona claves KMS y gestión de cifrado?', a: 'KMS', opts:['IAM','KMS','ACM','Secrets Manager'] },
      { q: '¿Qué base de datos NoSQL serverless ofrece latencias de milisegundos?', a: 'DynamoDB', opts:['Aurora','RDS','DynamoDB','Redshift'] },
      { q: '¿Qué servicio audita llamadas a la API de AWS?', a: 'CloudTrail', opts:['CloudWatch','CloudTrail','Config','Trusted Advisor'] }
    ];
    startQuiz.onclick = () => {
      let score = 0;
      quizEl.innerHTML = '';
      questions.forEach((item, idx) => {
        const block = document.createElement('div');
        block.className = 'card';
        const h = document.createElement('h3');
        h.textContent = `Pregunta ${idx+1}`;
        const p = document.createElement('p');
        p.textContent = item.q;
        block.appendChild(h);
        block.appendChild(p);
        item.opts.forEach(opt => {
          const b = document.createElement('button');
          b.className = 'btn';
          b.textContent = opt;
          b.onclick = () => {
            if (b.dataset.done) return;
            b.dataset.done = '1';
            if (opt === item.a) {
              b.style.borderColor = '#22c55e'; b.style.background='rgba(34,197,94,.15)';
              score++;
            } else {
              b.style.borderColor = '#ef4444'; b.style.background='rgba(239,68,68,.12)';
            }
            result.textContent = `Puntuación: ${score}/${questions.length}`;
          };
          block.appendChild(b);
        });
        quizEl.appendChild(block);
      });
      const result = document.createElement('p');
      result.className='lead';
      result.style.marginTop='12px';
      result.textContent = `Puntuación: 0/${questions.length}`;
      quizEl.appendChild(result);
    };
  }
})();