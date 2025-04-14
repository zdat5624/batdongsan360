package vn.thanhdattanphuoc.batdongsan360.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "vips")
public class Vip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private int vipLevel;

    @NotBlank(message = "Name không được để trống")
    private String name;

    private long pricePerDay;

    @OneToMany(mappedBy = "vip")
    @JsonIgnore
    private List<Post> posts;

    public Vip(int vipLevel,
            @NotBlank(message = "Name không được để trống") String name,
            long pricePerDay) {
        this.vipLevel = vipLevel;
        this.name = name;
        this.pricePerDay = pricePerDay;
    }

    public Vip() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public int getVipLevel() {
        return vipLevel;
    }

    public void setVipLevel(int vipLevel) {
        this.vipLevel = vipLevel;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    public long getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(long pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

}
