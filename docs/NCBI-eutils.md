# NCBI E-utilities Usage

* Send E-utilities requests to http://eutils.ncbi.nlm.nih.gov, not the standard NCBI web address.
* Use the &email= field (and the &tool= for distributed software) so that NCBI can track your project and contact you if there is a problem.
* For all scripts, do not send requests more than 3 per second.
* If you are sending unique identifiers (GI's, Accession numbers, Gene Ids etc.) you can send multiple UIDs per requests (up 500 per requests) rather than one per request.
* Limit all scripts to the off peak hours of 9 PM to 5 AM Eastern Standard Time (USA).