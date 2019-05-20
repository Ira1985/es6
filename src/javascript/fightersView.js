import View from './view';
import App from './app';
import Fighter from './fighter';
import FighterView from './fighterView';
import { fighterService } from './services/fightersService';

class FightersView extends View {
  constructor(fighters) {
    super();
    
    this.handleClick = this.handleFighterClick.bind(this);
    this.createFighters(fighters);

  }

  fightersDetailsMap = new Map();
  count = 0;
  readyFighterElem = [];
  readyFighterObj = [];
  createFighters(fighters) {
    const fighterElements = fighters.map(fighter => {
      const fighterView = new FighterView(fighter, this.handleClick);
      return fighterView.element;
    });

    this.element = this.createElement({ tagName: 'div', className: 'fighters' });
    this.element.append(...fighterElements);
  }

  async handleFighterClick(event, fighter) {
    let objFighter = null;
    let target = event.currentTarget;
    if(!this.fightersDetailsMap.has(fighter._id)) {
        const fighters = await fighterService.getFighterDetails(fighter._id);
        this.fightersDetailsMap.set(fighter._id, fighters);
    }
    let fighterDetails = this.fightersDetailsMap.get(fighter._id);
    if (event.target.tagName !== "INPUT") {       
       alert(`${fighterDetails.name}
             Health ${fighterDetails.health}
             Attack ${fighterDetails.attack}
             Defense ${fighterDetails.defense}`);
    } else {
       if (event.target.checked) {
           if (this.count == 0) {
               objFighter = new Fighter(fighterDetails.name, fighterDetails.health, fighterDetails.attack, fighterDetails.defense, target);
           } else if (this.count == 1) {
               objFighter = new Fighter(fighterDetails.name, fighterDetails.health, fighterDetails.attack, fighterDetails.defense, target);
           }
           this.readyFighterElem.push(target);
           this.readyFighterObj.push(objFighter);
           this.count += 1;
       } else {
           this.count -= 1;
           this.readyFighterElem.pop();
           this.readyFighterObj.pop();
       }
       if(this.count == 2) {
         let elem = document.getElementById('loading-overlay');
         elem.innerHTML = "";
         elem.style.visibility = 'visible';
         elem.append(...this.readyFighterElem);
         document.getElementById('root').style.visibility = 'hidden';

         let fighter1 = this.readyFighterObj[0];
         let fighter2 = this.readyFighterObj[1];

         let button = document.createElement("input");
         button.type = "button";
         button.value = "Start Fight";
         button.style.backgroundColor = "green";
         button.style.position = "absolute";
         button.style.marginTop = "210px";
         elem.appendChild(button);

         button.addEventListener("click", fight(fighter1, fighter2));
       }
    }
    // get from map or load info and add to fightersMap
    // show modal with fighter info
    // allow to edit health and power in this modal
  }
}

// auxiliary function for impact
function blow(fighter1, fighter2) {
	return function(result) {
		//Promise to be struck alternately from intervals per second
		return new Promise(resolve => {
			//the second beats the first
			if (result == fighter1.health) {
				let finalyForceHit = fighter2.getHitPower() - fighter1.getBlockPower();
				if(finalyForceHit < 0) { finalyForceHit = 0; }
				fighter1.health = fighter1.health - finalyForceHit;
				if(fighter1.health < 0) { fighter1.health = 0; }
				displayHealth(fighter1);
				setTimeout(() => resolve(fighter2.health), 1000);
			//the first beats the second
			} else if (result == fighter2.health) {
				let finalyForceHit = fighter1.getHitPower() - fighter2.getBlockPower();
				if(finalyForceHit < 0) { finalyForceHit = 0; }
				fighter2.health = fighter2.health - finalyForceHit;
				if(fighter2.health < 0) { fighter2.health = 0; }
				displayHealth(fighter2);
				setTimeout(() => resolve(fighter1.health), 1000);
			}
		});
	};
};

//battle function
function fight(fighter1, fighter2) {
	let blows = blow(fighter1, fighter2);
	return function() {
		let promise = Promise.resolve(fighter1.health);
		let i = 0;
		while (i < 500) {
			promise = promise.then(result => {
				//to finish the battle and determine the winner
				if (fighter1.health <= 0 || fighter2.health <= 0){
					if (fighter1.health <= 0) {
						displayWinner(fighter2);
					} else {
						displayWinner(fighter1);
					}
					Promise.resolve(false);
				};
				return blows(result);
			});
			i++;
		}
	}
};

//function to display the winner
function displayWinner(fighter) {
	let elem = document.getElementById('loading-overlay');
	elem.innerHTML = "";
	elem.style.visibility = 'visible';
	let winner = document.createElement('span');
	winner.className = 'name';
	fighter.divElem.removeChild(fighter.divElem.firstChild);
	winner.appendChild(document.createTextNode(`${fighter.name} WIIIIN`));
	fighter.divElem.insertBefore(winner, fighter.divElem.firstChild);
	elem.append(fighter.divElem);

        let button = document.createElement("input");
        button.type = "button";
        button.value = "Restart game";
        button.style.backgroundColor = "green";
        button.style.position = "absolute";
        button.style.marginTop = "210px";
        elem.appendChild(button);

        button.addEventListener("click", function() {
            window.location.href="../index.html"
        });
}

//function to display the course of the battle
function displayHealth(fighter) {
	if (fighter.divElem.firstChild.tagName == "SPAN") {
		fighter.divElem.removeChild(fighter.divElem.firstChild);
	};
	let health = document.createElement('span');
	health.className = 'name';
	health.appendChild(document.createTextNode(Math.round(fighter.health)));
	fighter.divElem.insertBefore(health, fighter.divElem.firstChild);
}

export default FightersView;