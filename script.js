class Hangman{
    constructor(maxMistakes = 6){
        this.maxMistakes = maxMistakes;
        this.isAnimating = false;
        this.scaleApplied = false;
        this.inizializeUI()
        this.resetGame();
    }

    async resetGame(){
        if(this.isAnimating){
            this.resetAnimation();
        }
        this.word = await this.getRandomWord();
        this.guessedLetters = new Set();
        this.mistakes = 0;
        this.updateUI();
        this.clearCanvas();
        this.drawGallows();
        this.enableKeyboard(true)
        this.showMessage('', 'black');
    }

    inizializeUI(){
        this.wordContainer = document.getElementById('word-container');
        this.lettersContainer = document.getElementById('letters-container');
        this.messageContainer = document.getElementById('message');
        this.canvas= document.getElementById('hangman-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lettersContainer.innerHTML= '';
        
        const letters = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
        letters.forEach(letter => {
            const letterBtn = document.createElement('div');
            letterBtn.className = 'letter';
            letterBtn.textContent = letter;
            letterBtn.addEventListener('click', () => {
                this.handleGuesss(letterBtn);
            });
            this.lettersContainer.appendChild(letterBtn);
        })

        this.canvas.width = 200;
        this.canvas.height = 250;
    }

    updateUI(){
        this.wordContainer.innerHTML= this.word.split('').map(letter => this.guessedLetters.has(letter)? letter : '_').join(' ');
    }

    enableKeyboard(enable){
        const letters = this.lettersContainer.getElementsByClassName('letter');
        for(let letter of letters){
            letter.classList.toggle('disabled', !enable);
            letter.style.pointerEvents = enable? 'auto' : 'none';
        }
    }

    handleGuesss(letterBtn){
        const letter = letterBtn.textContent;
        if(this.guessedLetters.has(letter)|| this.mistakes >= this.maxMistakes){
            return;
        }
        this.guessedLetters.add(letter);
        letterBtn.classList.add('disabled');
        if(this.word.includes(letter)){
            this.updateUI();
            if(this.checkWin()){
                this.showMessage('Kuchao!', 'lime');
                this.enableKeyboard(false);
                this.animateWin();
            }
        }else{
            this.mistakes++;
            this.animatedDrawHangman();
            if(this.mistakes === this.maxMistakes){
                this.showMessage('welebisho', 'red');
                this.enableKeyboard(false);
                //this.animateLose();
            }
        }
    }

    checkWin(){
        return this.word.split('').every(letter => this.guessedLetters.has(letter));
    }

    showMessage(message, color){
        this.messageContainer.textContent = message;
        this.messageContainer.style.color = color;

    }
    async getRandomWord(){
        try {
            const response = await fetch('https://random-word-api.herokuapp.com/word?lang=en');
            const data = await response.json();
            console.log(data)
            return data[0].toUpperCase();
        } catch (error) {
            console.error('Error fetching word: ',error);
            return 'Default';
        }
    }

    drawGallows(){
        const ctx = this.ctx;
        ctx.lineWidth = 2;
        ctx.strokeStyle= 'mediumslateblue';
        ctx.beginPath();
        ctx.moveTo(50, 220);
        ctx.lineTo(150, 220);
        ctx.stroke();
        ctx.moveTo(75, 220);
        ctx.lineTo(75, 50);
        ctx.lineTo(120, 50);
        ctx.lineTo(120,70);
        ctx.stroke();
    }

    animateCircle(x,y,radius){
        const ctx = this.ctx;
        let currentRadius = 0;
        const animate = ()=>{
            ctx.beginPath();
        ctx.arc(x,y, currentRadius, 0, Math.PI*2);
        ctx.stroke();
        if(currentRadius < radius){
            currentRadius +=1;
            this.animationFrame = requestAnimationFrame(animate);
        };

        };
        animate()
    }

    animateLine(x1,y1,x2,y2){
        const ctx = this.ctx;
        let progress = 0;
        const animate = () => {
            const currentX = x1 + (x2-x1)* progress;
            const currentY = y1 + (y2-y1)*progress;
            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            if(progress < 1){
                progress += 0.05;
                this.animationFrame = requestAnimationFrame(animate);
            };
        };
        animate();
    }
    
    animatedDrawHangman(){
        const ctx = this.ctx;
        ctx.lineWidth = 3; 
        ctx.strokeStyle = 'mediumslateblue';
        switch(this.mistakes){
            case 1://head
                this.animateCircle(120, 90, 20);
                break;
            case 2://body
                this.animateLine(120, 110, 120, 160);
                break;
            case 3://left hand 
                this.animateLine(120, 120, 100, 140);
                break;
            case 4://right hand
                this.animateLine(120, 120, 140, 140);
                break;
            case 5:
                this.animateLine(120, 160, 100, 190);
                break;
            case 6:
                this.animateLine(120, 160, 140, 190);
                break;
        }
    }
    clearCanvas(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
    animateWin(){
        if(this.isAnimating) return;
        this.isAnimating = true;
        this.scaleApplied = true;
        let scale = 1;
        const animate = () =>{
            this.wordContainer.style.transform = `scale(${scale})`;
            scale += 0.05;
            if(scale < 1.5){
                this.animationFrame = requestAnimationFrame(animate)
            };
        };
        animate();
    }
    animateLose(){
        if(this.isAnimating) return;
        this.isAnimating = true;
        let shake = 0;
        const animate = () =>{
            this.wordContainer.style.transform = `translate(${shake}px) 0.3s`;
            shake = shake === 0 ? 10 : 0;
            if(shake < 20){
                
                this.animationFrame = requestAnimationFrame(animate);
                
            }else{
                this.isAnimating = false;
                cancelAnimationFrame(this.animationFrame)
            };
        };
        animate();
    }

    resetAnimation(){
        this.wordContainer.style.transform = 'none';
        if(this.scaleApplied){
            this.wordContainer.style.fontSize = window.getComputedStyle(this.wordContainer, null).getPropertyValue('font-size') / 1.5;
            this.scaleApplied = false;
        }
        cancelAnimationFrame(this.animationFrame);
        this.isAnimating= false;
    }
}

document.addEventListener('DOMContentLoaded',() =>{
    let hangman = new Hangman();
    document.getElementById('new-game').addEventListener('click', ()=>hangman.resetGame())
})