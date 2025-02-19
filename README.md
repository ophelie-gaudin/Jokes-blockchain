# Hardhat Project

Ce projet démontre un cas d'utilisation de base de Hardhat. Il comprend un contrat, un test pour ce contrat, et un module Hardhat dans le dossier des scripts qui déploie ce contrat.


# Dad Jokes NFT Collection

Une application décentralisée pour créer et collectionner des blagues de papa sous forme de NFTs sur la blockchain Ethereum.

## Prérequis

- Node.js (v16+)
- npm
- Extension MetaMask

## Installation & Configuration

### 1. Installation du projet

##### Cloner le projet

git clone <https://github.com/ophelie-gaudin/Jokes-blockchain.git>

cd Jokes-blockchain

##### Installer les dépendances

npm install

cd frontend

npm install

### 2. Configuration de la Blockchain

Ouvrir 2 terminaux.

#### Terminal 1 : Démarrer la blockchain locale

npx hardhat node

#### Terminal 2 : Déployer le contrat

- npx hardhat compile
- npx hardhat run scripts/deploy.ts --network localhost

⚠️ **Important** : Copiez l'adresse du contrat déployé, vous en aurez besoin. _(étape 4.1)_

### 3. Configuration de MetaMask

1. Ouvrir MetaMask
2. Ajouter le réseau Hardhat :

    - Nom : Hardhat
    - URL RPC : <http://127.0.0.1:8545>
    - Chain ID : 31337 (ou 1337) # mappé à la valeur du chainId dans le fichier hardhat.config.ts
    - Symbole : ETH

3. Importer un compte test (prendre l'adresse d'un des wallet créé dans le terminal 1 où le node tourne) :

    - Copier une clé privée depuis le terminal hardhat
    - Dans MetaMask : Comptes -> Importer -> Coller la clé

### 4. Configuration du serveur ipfs

1. Démarrer le serveur ipfs : à partir du répertoire de base naviguez vers le dossier ipfs: `cd ipfs && docker-compose up -d`
   - adresse du serveur ipfs pour l'upload des fichiers : <http://localhost:5001/api/v0/add>
   - Gateway: adresse du serveur ipfs pour la récupération des fichiers : <http://localhost:8080/ipfs/{ipfsHash}>

### 5. Configuration du Frontend

1. Mettre à jour l'adresse du contrat et l'abi', ces informations se retrouvent dans le fichier DadJokeNFT.json du dossier
   - `\Jokes-blockchain\artifacts\contracts\DadJokeNFT.sol` 
  généré lors de l'étape 2

    ```typescript
    // frontend/src/config/contract.ts
    export const JOKE_NFT_ADDRESS = 'votre-adresse-de-contrat'
    ```

    ```typescript
    // frontend/src/config/contract.ts
    export const JOKE_NFT_ABI = 'votre-abi'
    ```

1. Démarrer l'application :

    ```bash
    cd frontend
    npm run dev
    ```

2. Ouvrir <http://localhost:5173>

## Utilisation

1. **Connecter son wallet**

    - Cliquer sur "Connect Wallet"
    - Sélectionner le compte Hardhat importé

2. **Créer une blague**

    - Remplir le contenu
    - Choisir le type
    - Définir la valeur
    - Cliquer sur "Mint Joke"

3. **Voir les blagues**

    - Toutes les blagues apparaissent dans l'espace ` Vote to create a nft`, `Buy access`, `Marketplace` suivant leur état.
    - Possibilité de voter pour les blagues pour les transformer en NFT.
    - Lorsqu'ils sont déjà des NFTs les votes achètent les droits d'usage des blagues.
    - Les votes achetés sur le Marketplace changent de proprietaire.

## Problèmes courants

1. **Si vous redémarrez le nœud Hardhat**

    - Redéployer le contrat
    - Mettre à jour l'adresse dans `contract.ts`
    - Réinitialiser le compte MetaMask

2. **Si les transactions échouent**

    - Vérifier que MetaMask est sur le réseau Hardhat
    - Réinitialiser le compte : Paramètres -> Avancé -> Réinitialiser

3. **Si les blagues ne s'affichent pas**

    - Vérifier la console pour les erreurs
    - Vérifier l'adresse du contrat
    - Rafraîchir la page

## Structure du projet

├───contracts            
├───frontend           
│      ├───public   
│      └───src  
│       ├───assets  
│       ├───components  
│       └───config  
├───ignition  
│   └───modules  
├───ipfs  
│   └───file  
├───scripts  
├───test  
└───typechain-types