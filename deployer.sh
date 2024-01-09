g1=""
CopierFunction() 
{ 
    bash copier.sh
}
CleanserFunction(){
    bash cleanser.sh
}
ImageBuilder(){
    bash imagebuilder.sh
}
BasicAnsibleDeployer(){
    ansible-playbook -i hosts base_deploy.yaml
}
Deploy_GTSOCIAL_AnsibleDeployer(){
   ansible-playbook -i hosts deploy_gtsocial.yaml
}
val=$(CopierFunction)
echo $val




cd ../Releases
cp General_Files/* $val
cd $val

echo "we are inside Releases/$val"

val2=$(CleanserFunction)
val3=$(ImageBuilder)
# val4=$(BasicAnsibleDeployer)
# val5=$(Deploy_GTSOCIAL_AnsibleDeployer)

# echo $val5
ansible-playbook -i hosts deploy_gtsocial.yaml
echo "we are inside Releases/$val and finished the deployer.sh script"

