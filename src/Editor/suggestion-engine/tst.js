class Node{
	constructor(val = null){
		this.val = val;
		this.end = false
		this.left = null
		this.right = null
		this.equal =null
		this.type = null
	}
}


class TST{
	constructor(){
		this.root = null
		this.vol = 0
	}

	insert(word, type){
		if(word.length === 0) return;
		if(this.root === null) this.root = new Node(word[0]);
		var curr = this.root, index = 0;
		while(index < word.length){
			let l = word[index];
			if(l < curr.val){
				if(curr.left === null) curr.left = new Node(l)
				curr = curr.left;
			}
			else if(l > curr.val){
				if(curr.right === null) curr.right = new Node(l)
				curr = curr.right
			}
			else if(l === curr.val){
				if (index + 1 === word.length){
					if(!curr.end) this.vol ++;
					curr.end = true;
					curr.type = type;
				}
				if(curr.equal === null){
					if(index + 1 < word.length) curr.equal = new Node(word[index + 1])
				}
				curr = curr.equal;
				index ++;
			}
		}
	}

	search(word){
		var curr = this.root, index = 0;
		while(index < word.length){
			if(curr === null) return false;
			let l = word[index];
			if(l < curr.val) curr = curr.left;
			else if(l > curr.val) curr = curr.right;
			else if(l === curr.val){
				if(index + 1 === word.length && curr.end) return true;
				curr = curr.equal;
				index += 1;
			}
		}
		return false;
	}

	traverseRecursive(curr, l, word){
		if(curr === null) return;
		if(curr.end) l.push(word + curr.val);
		this.traverseRecursive(curr.left, l, word);
		this.traverseRecursive(curr.right, l, word);
		this.traverseRecursive(curr.equal, l, word + curr.val);
	}

	traverse(node){
		let l = [];
		let word = "";
		this.traverseRecursive(node, l, word);
		return l;
	}

	partialSearch(prefix){
		var curr = this.root, index = 0;
		var end = null;
		while(index < prefix.length){
			if(curr === null) break;
			let l = prefix[index];
			if(l < curr.val) curr = curr.left;
			if(l > curr.val) curr = curr.right;
			if(l === curr.val){
				if(index + 1 === prefix.length){
					end = curr;
					break;
				}
				curr = curr.equal;
				index += 1;
			}
		}

		if(end === null) return [];
		let matches = this.traverse(end.equal);
		matches = matches.map(i => prefix + i);
		return matches;
	}
}

export default TST;