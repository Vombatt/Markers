/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.markers;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 *
 * @author Alexey
 */
public interface MarkerMapper {
    /*@Results({
        @Result(property = "id", column = "id"),
        @Result(property = "feature", column = "feature")
    })*/
    @Select("SELECT feature FROM features")
    List<String>selectFeatures();
    
    @Insert("INSERT into features(id, feature) VALUES(#{id}, #{feature})")
    void insertMarker(Marker marker);
    
    @Update("UPDATE features SET feature=#{feature} WHERE id=#{id}")
    void updateMarker(Marker marker);
    
    @Delete("DELETE FROM features WHERE id=#{id}")
    void deleteMarker(Long id);
}
