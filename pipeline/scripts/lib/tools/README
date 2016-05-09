# INSTALLING BIOINFORMATICS TOOLS

Variables are defined in doucle curly brackets eg {{A_VARIABLE}}
{{ABSOLUTE_PATH}} The path that your repository (mist3-api) located

## HMMER3 and HMM databases

### Installing HMMER3
```
wget http://eddylab.org/software/hmmer3/3.1b2/hmmer-3.1b2-linux-intel-x86_64.tar.gz
tar xzvf hmmer-3.1b2hmmer-3.1b2-linux-intel-x86_64.tar.gz
cd hmmer-3.1b2-linux-intel-x86_64
cp * {{ABSOLUTE_PATH}}/mist3-api/pipeline/scripts/lib/tools/hmmer3/
./configure --prefix {{ABSOLUTE_PATH}}/mist3-api/pipeline/scripts/lib/tools/hmmer3
make
make check
make install
```
### Downloading and preparing the PFAM database 
```
cd {{ABSOLUTE_PATH}}/mist3-api/db/pfam/29.0
wget ftp://ftp.ebi.ac.uk/pub/databases/Pfam/releases/Pfam29.0/Pfam-A.hmm.gz
wget ftp://ftp.ebi.ac.uk/pub/databases/Pfam/releases/Pfam29.0/Pfam-A.hmm.dat.gz
gunzip Pfam-A.full.gz
gunzip Pfam-A.hmm.dat.gz
hmmpress Pfam-A.hmm
```

### TMHMM



### COILS


### SEG
