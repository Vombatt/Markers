/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.markers;

/**
 *
 * @author Alexey
 */
public class Marker {
    private Long id;
    private String feature;
    
    public Long getId(){
        return id;
    }
    
    public void setId(Long id){
        this.id = id;
    }
    
    public String getFeature(){
        return feature;
    }
    
    public void setFeature(String feature){
        this.feature = feature;
    }
}
